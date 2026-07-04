import inspect
import json
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass

import uvicorn
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from pytriz import TRIZStore
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route

from app.core.config import Config, config
from app.core.logger import setup_logging
from app.services.triz import get_store
from app.tools import register as register_tools
from app.tools import tools as tool_list

logger = logging.getLogger(__name__)


@dataclass
class AppContext:
    config: Config
    store: TRIZStore


@asynccontextmanager
async def lifespan(server: FastMCP) -> AsyncIterator[AppContext]:
    setup_logging()
    store = get_store()
    yield AppContext(config=config, store=store)


mcp = FastMCP(
    config.MCP_NAME,
    lifespan=lifespan,
    transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=False),
)

# ---------------------------------------------------------------------------
# Register tools, resources, and prompts
# ---------------------------------------------------------------------------

register_tools(mcp)


# ---------------------------------------------------------------------------
# Plain-REST bridge for the NestJS backend
#
# The backend's McpClientService speaks REST: POST /tools/{tool_name} with body
# { "arguments": {...} }, expecting { "content": [{ "text": "..." }] }. FastMCP's
# streamable_http_app() only serves the MCP protocol at /mcp, so without this
# bridge every backend tool call 404s (finding #1). We dispatch the same registered
# tool callables and wrap their result in the content envelope the backend parses.
# ---------------------------------------------------------------------------

REST_TOOLS = {fn.__name__: fn for fn in tool_list}


def _serialize(result: object) -> str:
    if isinstance(result, str):
        return result
    if hasattr(result, "model_dump"):
        return json.dumps(result.model_dump())
    return json.dumps(result)


async def rest_tool_handler(request: Request) -> JSONResponse:
    tool_name = request.path_params["tool_name"]
    fn = REST_TOOLS.get(tool_name)
    if fn is None:
        return JSONResponse({"error": f"Unknown tool: {tool_name}"}, status_code=404)
    try:
        body = await request.json()
    except Exception:
        body = {}
    arguments = body.get("arguments", {}) if isinstance(body, dict) else {}
    try:
        result = fn(**arguments)
        if inspect.isawaitable(result):
            result = await result
        return JSONResponse({"content": [{"type": "text", "text": _serialize(result)}]})
    except Exception as exc:  # noqa: BLE001 - surface tool errors to the caller
        logger.exception("REST tool '%s' failed", tool_name)
        return JSONResponse({"error": str(exc)}, status_code=500)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app = mcp.streamable_http_app()
    # Insert the REST bridge ahead of the MCP catch-all, on the SAME app so it keeps
    # the streamable-HTTP session-manager lifespan (leaving /mcp fully functional).
    app.router.routes.insert(
        0, Route("/tools/{tool_name}", rest_tool_handler, methods=["POST"])
    )
    app = CORSMiddleware(
        app,
        allow_origins=["*"],
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["*"],
        expose_headers=["Mcp-Session-Id"],
    )
    uvicorn.run(app, host=config.MCP_HOST, port=config.MCP_PORT)
