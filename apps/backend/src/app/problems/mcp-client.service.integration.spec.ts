import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { McpClientService } from './mcp-client.service';

/**
 * LIVE MCP integration — requires the FastMCP daemon running (MCP_SERVER_URL / :8123).
 *
 * Finding #1 (FIXED): the server now exposes a plain-REST bridge at
 * POST /tools/{tool} (alongside the MCP protocol at /mcp), so the backend client
 * reaches the pytriz retrieval tools instead of 404-ing. These tests exercise the
 * key-free retrieval tools end-to-end (the agent_* tools additionally require a
 * Google Antigravity key, which is out of scope here).
 *
 * A precondition check proves the daemon is up so a failure means "wrong response"
 * not "server down".
 */
describe('McpClientService (Integration, live daemon)', () => {
  let service: McpClientService;
  const BASE = process.env.MCP_SERVER_URL || 'http://localhost:8123';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [McpClientService],
    }).compile();
    service = module.get<McpClientService>(McpClientService);

    try {
      await axios.get(`${BASE}/mcp`, { validateStatus: () => true });
    } catch (err: any) {
      throw new Error(
        `MCP daemon unreachable at ${BASE}. Start it (\`cd apps/mcp-server && uv run python app/main.py\`) ` +
          `before running \`nx test-integration backend\`. Cause: ${err.message}`
      );
    }
  });

  it('browseContradictionMatrix returns real TRIZ inventive principles from pytriz', async () => {
    const res = await service.browseContradictionMatrix(9, 36);
    expect(typeof res).toBe('string');
    expect(res).toMatch(/Inventive Principle/i);
  });

  it('searchParameter returns semantically matched TRIZ parameters from pytriz', async () => {
    const res = await service.searchParameter('thermal insulation');
    expect(typeof res).toBe('string');
    expect(res).toMatch(/TRIZ parameter/i);
  });
});
