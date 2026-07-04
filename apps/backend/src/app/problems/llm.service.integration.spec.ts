import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from './llm.service';
import { McpClientService } from './mcp-client.service';

describe('LlmService (Integration)', () => {
  const mockMcpClientService = {
    callTool: jest.fn().mockImplementation((toolName, args) => {
      if (toolName === 'agent_contradiction') {
        return Promise.resolve({
          improvingParamCode: 9,
          improvingParamName: 'Speed',
          worseningParamCode: 36,
          worseningParamName: 'Device complexity',
          explanation: 'Explanation from MCP',
        });
      }
      return Promise.resolve({});
    }),
  };

  async function createService(envOverrides: Record<string, string> = {}): Promise<LlmService> {
    const originalEnv = { ...process.env };
    
    // Apply overrides before importing or instantiating
    for (const [key, value] of Object.entries(envOverrides)) {
      process.env[key] = value;
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        { provide: McpClientService, useValue: mockMcpClientService },
      ],
    }).compile();

    // Restore env immediately
    process.env = originalEnv;

    return module.get<LlmService>(LlmService);
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call MCP server in default (production) mode', async () => {
    const originalProvider = process.env.LLM_PROVIDER;
    delete process.env.LLM_PROVIDER;

    const testService = await createService();
    const res = await testService.generateContradiction('Test description');
    expect(res).toBeDefined();
    expect(res.explanation).toBe('Explanation from MCP');
    expect(mockMcpClientService.callTool).toHaveBeenCalledWith('agent_contradiction', { problem: 'Test description' });

    if (originalProvider) {
      process.env.LLM_PROVIDER = originalProvider;
    }
  });

  it('should fall back to Mock generator when Ollama is selected but unreachable', async () => {
    const testService = await createService({
      LLM_PROVIDER: 'ollama',
      OLLAMA_BASE_URL: 'http://localhost:9999', // Invalid port to force HTTP failure
    });

    const res = await testService.generateContradiction('Test description');
    expect(res).toBeDefined();
    expect(res.improvingParamName).toBe('Speed');
    expect(res.explanation).toContain('[MOCK]');
  });
});
