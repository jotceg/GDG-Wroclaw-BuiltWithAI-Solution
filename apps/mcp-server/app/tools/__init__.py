from mcp.server.fastmcp import FastMCP

from app.tools.contradictions import (
    browse_contradiction_matrix,
    get_parameter_by_id,
    get_principle_by_id,
    get_random_principles,
    search_parameter,
    search_principle,
)
from app.tools.agents_tools import (
    agent_contradiction,
    agent_triz_solutions,
    agent_five_whys_next,
    agent_five_whys_solutions,
    agent_evaluate,
    agent_select,
)

tools = [
    # Data / retrieval
    browse_contradiction_matrix,
    search_parameter,
    search_principle,
    get_random_principles,
    get_principle_by_id,
    get_parameter_by_id,
    # Antigravity Agents
    agent_contradiction,
    agent_triz_solutions,
    agent_five_whys_next,
    agent_five_whys_solutions,
    agent_evaluate,
    agent_select,
]


def register(mcp: FastMCP) -> None:
    for tool in tools:
        mcp.tool()(tool)
