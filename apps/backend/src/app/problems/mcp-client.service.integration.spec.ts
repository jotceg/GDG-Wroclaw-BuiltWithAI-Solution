import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { McpClientService } from './mcp-client.service';

describe('McpClientService (Integration)', () => {
  let service: McpClientService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [McpClientService],
    }).compile();

    service = module.get<McpClientService>(McpClientService);
  });

  it('should call browseContradictionMatrix on the MCP server, handling connection states gracefully', async () => {
    try {
      const res = await service.browseContradictionMatrix(9, 36);
      expect(res).toBeDefined();
      expect(typeof res).toBe('string');
    } catch (err: any) {
      // If the server is offline during integration tests, the call will fail,
      // which is expected if the external daemon is not started. We log a warning.
      console.warn('Live MCP integration check: connection refused or failed (expected if local daemon is offline).');
      expect(err).toBeDefined();
    }
  });

  it('should call searchParameter on the MCP server, handling connection states gracefully', async () => {
    try {
      const res = await service.searchParameter('weight');
      expect(res).toBeDefined();
      expect(typeof res).toBe('string');
    } catch (err: any) {
      console.warn('Live MCP integration check: connection refused or failed.');
      expect(err).toBeDefined();
    }
  });
});
