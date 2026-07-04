import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { McpClientService } from './mcp-client.service';

jest.mock('axios');
const mockedPost = axios.post as jest.Mock;

/**
 * McpClientService unit test (axios mocked — no live MCP daemon).
 *
 * Pins the wire contract the backend speaks: POST {baseUrl}/tools/{tool} with body
 * { arguments }, then parse response.data.content[0].text (JSON, else raw). The MCP
 * server now serves exactly this shape via its REST bridge (finding #1 fixed); the
 * live end-to-end coverage lives in mcp-client.service.integration.spec.ts.
 */
describe('McpClientService', () => {
  let service: McpClientService;
  const BASE = process.env.MCP_SERVER_URL || 'http://localhost:8123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [McpClientService],
    }).compile();
    service = module.get<McpClientService>(McpClientService);
    mockedPost.mockReset();
  });

  it('posts to /tools/{tool} with { arguments } and parses JSON content', async () => {
    mockedPost.mockResolvedValue({
      data: { content: [{ text: JSON.stringify({ improvingParamCode: 9, explanation: 'ok' }) }] },
    });

    const res = await service.callTool('agent_contradiction', { problem: 'Buildings' });

    expect(mockedPost).toHaveBeenCalledWith(`${BASE}/tools/agent_contradiction`, {
      arguments: { problem: 'Buildings' },
    });
    expect(res).toEqual({ improvingParamCode: 9, explanation: 'ok' });
  });

  it('returns raw text when content is not JSON', async () => {
    mockedPost.mockResolvedValue({ data: { content: [{ text: 'principle 10, 35' }] } });

    const res = await service.callTool('search_parameter', { query: 'weight' });

    expect(res).toBe('principle 10, 35');
  });

  it('throws when the response has no content', async () => {
    mockedPost.mockResolvedValue({ data: {} });
    await expect(service.callTool('agent_contradiction', {})).rejects.toThrow(/no content/);
  });

  it('rethrows transport errors (e.g. 404 / connection refused)', async () => {
    mockedPost.mockRejectedValue(new Error('Request failed with status code 404'));
    await expect(service.callTool('agent_contradiction', {})).rejects.toThrow(/404/);
  });

  it('searchParameter maps to search_parameter { query }', async () => {
    mockedPost.mockResolvedValue({ data: { content: [{ text: 'ok' }] } });
    await service.searchParameter('weight');
    expect(mockedPost).toHaveBeenCalledWith(`${BASE}/tools/search_parameter`, { arguments: { query: 'weight' } });
  });

  it('browseContradictionMatrix maps improving/preserving param arrays', async () => {
    mockedPost.mockResolvedValue({ data: { content: [{ text: 'ok' }] } });
    await service.browseContradictionMatrix(9, 36);
    expect(mockedPost).toHaveBeenCalledWith(`${BASE}/tools/browse_contradiction_matrix`, {
      arguments: { improving_params: [9], preserving_params: [36] },
    });
  });
});
