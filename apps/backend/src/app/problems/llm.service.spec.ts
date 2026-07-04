import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from './llm.service';
import { McpClientService } from './mcp-client.service';

/**
 * LlmService unit tests (no live infra).
 *
 * Two behaviours are pinned:
 *  1. MCP mode (default / production, LLM_PROVIDER != 'ollama'): each method must
 *     route to the correct MCP agent tool with the documented argument shape
 *     (docs/04_architecture.md tool list).
 *  2. Ollama fallback: when LLM_PROVIDER='ollama' and Ollama is unreachable, the
 *     service must fall back to mockFallback() and tag output with [MOCK].
 *
 * Finding #7 (FIXED): mockFallback() now dispatches on an explicit step `kind`
 * rather than fragile prompt-keyword matching, so every step returns its correct
 * shape offline (TRIZ/five-whys -> `.solutions`, evaluate -> `.evaluations` keyed
 * to the real candidate ids). The tests below pin that fixed behaviour.
 *
 * The Ollama-unreachable tests point at 127.0.0.1:9 (discard port) so the axios
 * call fails fast with ECONNREFUSED and needs no running service.
 */
describe('LlmService', () => {
  const UNREACHABLE_OLLAMA = 'http://127.0.0.1:9';

  const mockMcpClient = {
    callTool: jest.fn(),
  };

  /** Build LlmService with env overrides applied only during construction. */
  async function createService(envOverrides: Record<string, string | undefined> = {}): Promise<LlmService> {
    const saved: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(envOverrides)) {
      saved[k] = process.env[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [LlmService, { provide: McpClientService, useValue: mockMcpClient }],
    }).compile();

    // restore env after the (readonly) fields have been captured in the constructor
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    return module.get<LlmService>(LlmService);
  }

  afterEach(() => jest.clearAllMocks());

  describe('MCP mode (production) tool routing', () => {
    const mcpEnv = { LLM_PROVIDER: undefined };

    it('generateContradiction -> agent_contradiction { problem }', async () => {
      mockMcpClient.callTool.mockResolvedValue({ explanation: 'from mcp' });
      const svc = await createService(mcpEnv);

      const res = await svc.generateContradiction('Buildings hot and cold');

      expect(mockMcpClient.callTool).toHaveBeenCalledWith('agent_contradiction', { problem: 'Buildings hot and cold' });
      expect(res.explanation).toBe('from mcp');
    });

    it('generateTrizSolutions -> agent_triz_solutions { problem, improving_code, worsening_code } and unwraps .solutions', async () => {
      mockMcpClient.callTool.mockResolvedValue({ solutions: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] });
      const svc = await createService(mcpEnv);

      const res = await svc.generateTrizSolutions('Buildings', 9, 36);

      expect(mockMcpClient.callTool).toHaveBeenCalledWith('agent_triz_solutions', {
        problem: 'Buildings',
        improving_code: 9,
        worsening_code: 36,
      });
      expect(res).toHaveLength(3);
    });

    it('askNextWhy -> agent_five_whys_next { problem, history }', async () => {
      const history = [{ question: 'Why?', answer: 'Because', kind: 'answer', confirmed: true }];
      mockMcpClient.callTool.mockResolvedValue({ question: 'Why again?', isAbuseOrOffTopic: false });
      const svc = await createService(mcpEnv);

      await svc.askNextWhy('Buildings', history);

      expect(mockMcpClient.callTool).toHaveBeenCalledWith('agent_five_whys_next', { problem: 'Buildings', history });
    });

    it('generateFiveWhysSolutions -> agent_five_whys_solutions { problem, root_cause } and unwraps .solutions', async () => {
      mockMcpClient.callTool.mockResolvedValue({ solutions: [{ title: 'X' }, { title: 'Y' }, { title: 'Z' }] });
      const svc = await createService(mcpEnv);

      const res = await svc.generateFiveWhysSolutions('Buildings', 'root cause chain');

      expect(mockMcpClient.callTool).toHaveBeenCalledWith('agent_five_whys_solutions', {
        problem: 'Buildings',
        root_cause: 'root cause chain',
      });
      expect(res).toHaveLength(3);
    });

    it('evaluateSolutions -> agent_evaluate { problem, solutions } and unwraps .evaluations', async () => {
      const solutions = [{ id: 's1', title: 'A', description: 'd', method: 'triz' }];
      mockMcpClient.callTool.mockResolvedValue({ evaluations: [{ solutionId: 's1', criterion: 'cost', score: 5, reasoning: 'r' }] });
      const svc = await createService(mcpEnv);

      const res = await svc.evaluateSolutions('Buildings', solutions);

      expect(mockMcpClient.callTool).toHaveBeenCalledWith('agent_evaluate', { problem: 'Buildings', solutions });
      expect(res).toHaveLength(1);
    });

    it('selectBestSolution -> agent_select { problem, evaluations }', async () => {
      const evaluated = [{ id: 's1', evaluations: [] }];
      mockMcpClient.callTool.mockResolvedValue({ selectedSolutionId: 's1', justification: 'best' });
      const svc = await createService(mcpEnv);

      const res = await svc.selectBestSolution('Buildings', evaluated);

      expect(mockMcpClient.callTool).toHaveBeenCalledWith('agent_select', { problem: 'Buildings', evaluations: evaluated });
      expect(res.selectedSolutionId).toBe('s1');
    });
  });

  describe('Ollama fallback', () => {
    it('falls back to [MOCK] contradiction when Ollama is unreachable', async () => {
      const svc = await createService({ LLM_PROVIDER: 'ollama', OLLAMA_BASE_URL: UNREACHABLE_OLLAMA });

      const res = await svc.generateContradiction('Buildings hot and cold');

      expect(res.improvingParamName).toBe('Speed');
      expect(res.explanation).toContain('[MOCK]');
      // MCP client must NOT be touched in ollama mode
      expect(mockMcpClient.callTool).not.toHaveBeenCalled();
    });

    // Finding #7 fixed: TRIZ fallback now returns >=3 correctly-shaped mock solutions
    // (previously it misrouted and returned undefined, crashing the caller's .map()).
    it('TRIZ fallback returns >=3 [MOCK] solutions when Ollama is down', async () => {
      const svc = await createService({ LLM_PROVIDER: 'ollama', OLLAMA_BASE_URL: UNREACHABLE_OLLAMA });

      const res = await svc.generateTrizSolutions('Buildings hot and cold', 9, 36);

      expect(res).toHaveLength(3);
      expect(res.every((s) => s.title.includes('[MOCK]') && s.principleCode)).toBe(true);
    });

    it('evaluate fallback produces evaluations keyed to the real candidate ids', async () => {
      const svc = await createService({ LLM_PROVIDER: 'ollama', OLLAMA_BASE_URL: UNREACHABLE_OLLAMA });
      const solutions = [
        { id: 'real-1', title: 'A', description: 'd', method: 'triz' },
        { id: 'real-2', title: 'B', description: 'd', method: 'fivewhys' },
      ];

      const res = await svc.evaluateSolutions('Buildings', solutions);

      // 2 candidates x 4 criteria, all referencing the real ids (FK-safe offline trail)
      expect(res).toHaveLength(8);
      expect(new Set(res.map((e) => e.solutionId))).toEqual(new Set(['real-1', 'real-2']));
      expect(res.every((e) => ['feasibility', 'impact', 'cost', 'innovation'].includes(e.criterion))).toBe(true);
    });

    it('select fallback picks the first real candidate id', async () => {
      const svc = await createService({ LLM_PROVIDER: 'ollama', OLLAMA_BASE_URL: UNREACHABLE_OLLAMA });

      const res = await svc.selectBestSolution('Buildings', [{ id: 'real-1' }, { id: 'real-2' }]);

      expect(res.selectedSolutionId).toBe('real-1');
      expect(res.justification).toContain('[MOCK]');
    });
  });
});
