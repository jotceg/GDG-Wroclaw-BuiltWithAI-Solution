import { Injectable, Logger } from '@nestjs/common';
import { McpClientService } from './mcp-client.service';
import axios from 'axios';

/** Pipeline step a fallback payload is being produced for (deterministic routing). */
type FallbackKind = 'contradiction' | 'triz' | 'fivewhys_next' | 'fivewhys_solutions' | 'evaluate' | 'select';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly isOllama = process.env.LLM_PROVIDER === 'ollama';
  private readonly ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private readonly ollamaModel = process.env.OLLAMA_MODEL || 'llama3';

  constructor(private readonly mcpClient: McpClientService) {}

  private async callOllama<T>(
    prompt: string,
    systemInstruction: string,
    kind: FallbackKind,
    context?: any
  ): Promise<T> {
    this.logger.log(`Calling Ollama (${kind}) with prompt: ${prompt}`);
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: this.ollamaModel,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        stream: false,
        format: 'json',
      });
      const text = response.data?.message?.content;
      return JSON.parse(text) as T;
    } catch (err: any) {
      this.logger.error(`Ollama failed: ${err.message}. Running Mock fallback (${kind}).`);
      return this.mockFallback(kind, context);
    }
  }

  /**
   * Deterministic offline fallback keyed by pipeline step (NOT by fragile prompt
   * keyword matching, which previously misrouted the TRIZ/evaluate prompts and
   * crashed the caller). Every branch returns the exact shape its caller expects,
   * so the pipeline degrades gracefully instead of 500-ing when no LLM is reachable.
   * `evaluate` / `select` use the REAL candidate ids from `context` so the offline
   * trail stays foreign-key-consistent.
   */
  private mockFallback(kind: FallbackKind, context?: any): any {
    this.logger.warn(`Running Mock Fallback (${kind}).`);
    switch (kind) {
      case 'contradiction':
        return {
          improvingParamCode: 9,
          improvingParamName: 'Speed',
          worseningParamCode: 36,
          worseningParamName: 'Device complexity',
          explanation: '[MOCK] Increasing speed requires more complex components.',
        };
      case 'triz':
        return {
          solutions: [
            { title: '[MOCK] Pre-heating pipes', description: 'Pre-heat input pipes.', principleCode: '10', principleName: 'Prior Action' },
            { title: '[MOCK] Thermal coating', description: 'Apply dynamic paint.', principleCode: '32', principleName: 'Color change' },
            { title: '[MOCK] Flexible ducts', description: 'Use pneumatic ducting.', principleCode: '35', principleName: 'Parameter Change' },
          ],
        };
      case 'fivewhys_next':
        return {
          question: '[MOCK] Why do buildings need thermal insulation?',
          isAbuseOrOffTopic: false,
          suggestedHypothesis: '[MOCK] Using thermal mass could regulate heat.',
        };
      case 'fivewhys_solutions':
        return {
          solutions: [
            { title: '[MOCK] Countermeasure A', description: 'Fixes cause A.' },
            { title: '[MOCK] Countermeasure B', description: 'Fixes cause B.' },
            { title: '[MOCK] Countermeasure C', description: 'Fixes cause C.' },
          ],
        };
      case 'evaluate': {
        const solutions: Array<{ id: string }> = Array.isArray(context) ? context : [];
        const criteria = ['feasibility', 'impact', 'cost', 'innovation'];
        const scores: Record<string, number> = { feasibility: 8, impact: 7, cost: 6, innovation: 9 };
        const evaluations = solutions.flatMap((s) =>
          criteria.map((criterion) => ({
            solutionId: s.id,
            criterion,
            score: scores[criterion],
            reasoning: `[MOCK] ${criterion} assessment for candidate ${s.id}.`,
          }))
        );
        return { evaluations };
      }
      case 'select': {
        const candidates: Array<{ id: string }> = Array.isArray(context) ? context : [];
        const selectedSolutionId = candidates[0]?.id ?? '';
        return {
          selectedSolutionId,
          justification: '[MOCK] Selected candidate due to best overall balanced score.',
        };
      }
    }
  }

  async generateContradiction(problemDescription: string): Promise<{ improvingParamCode: number; improvingParamName: string; worseningParamCode: number; worseningParamName: string; explanation: string }> {
    if (this.isOllama) {
      return this.callOllama(
        `Identify the contradiction for: ${problemDescription}`,
        "You are a contradiction analyzer. Return JSON with keys: improvingParamCode (1-39), improvingParamName, worseningParamCode (1-39), worseningParamName, explanation.",
        'contradiction'
      );
    }
    return this.mcpClient.callTool('agent_contradiction', { problem: problemDescription });
  }

  async generateTrizSolutions(
    problemDescription: string,
    improvingCode: number,
    worseningCode: number
  ): Promise<Array<{ title: string; description: string; principleCode: string; principleName: string }>> {
    if (this.isOllama) {
      const res = await this.callOllama<{ solutions: any[] }>(
        `Problem: ${problemDescription}. Improving Code: ${improvingCode}, Worsening Code: ${worseningCode}`,
        "Return JSON with key 'solutions' containing objects with: title, description, principleCode, principleName.",
        'triz'
      );
      return res.solutions;
    }
    const res = await this.mcpClient.callTool<{ solutions: any[] }>('agent_triz_solutions', {
      problem: problemDescription,
      improving_code: improvingCode,
      worsening_code: worseningCode,
    });
    return res.solutions;
  }

  async askNextWhy(problemDescription: string, history: Array<{ question: string; answer: string; kind: string; confirmed: boolean }>): Promise<{ question: string; isAbuseOrOffTopic: boolean; suggestedHypothesis?: string }> {
    if (this.isOllama) {
      return this.callOllama(
        `Problem: ${problemDescription}. History: ${JSON.stringify(history)}`,
        "You facilitate a 5 whys analysis. Return JSON with keys: question, isAbuseOrOffTopic, suggestedHypothesis.",
        'fivewhys_next'
      );
    }
    return this.mcpClient.callTool('agent_five_whys_next', {
      problem: problemDescription,
      history,
    });
  }

  async generateFiveWhysSolutions(problemDescription: string, rootCause: string): Promise<Array<{ title: string; description: string }>> {
    if (this.isOllama) {
      const res = await this.callOllama<{ solutions: any[] }>(
        `Problem: ${problemDescription}. Root Cause: ${rootCause}`,
        "Generate 3 countermeasures. Return JSON with key 'solutions' containing objects with: title, description.",
        'fivewhys_solutions'
      );
      return res.solutions;
    }
    const res = await this.mcpClient.callTool<{ solutions: any[] }>('agent_five_whys_solutions', {
      problem: problemDescription,
      root_cause: rootCause,
    });
    return res.solutions;
  }

  async evaluateSolutions(problemDescription: string, solutions: Array<{ id: string; title: string; description: string; method: string }>): Promise<Array<{ solutionId: string; criterion: string; score: number; reasoning: string }>> {
    if (this.isOllama) {
      const res = await this.callOllama<{ evaluations: any[] }>(
        `Problem: ${problemDescription}. Candidates: ${JSON.stringify(solutions)}`,
        "Evaluate solutions. Return JSON with key 'evaluations' containing objects with: solutionId, criterion, score, reasoning.",
        'evaluate',
        solutions
      );
      return res.evaluations;
    }
    const res = await this.mcpClient.callTool<{ evaluations: any[] }>('agent_evaluate', {
      problem: problemDescription,
      solutions,
    });
    return res.evaluations;
  }

  async selectBestSolution(problemDescription: string, evaluatedSolutions: any[]): Promise<{ selectedSolutionId: string; justification: string }> {
    if (this.isOllama) {
      return this.callOllama(
        `Problem: ${problemDescription}. Evaluated: ${JSON.stringify(evaluatedSolutions)}`,
        "Select the best. Return JSON with keys: selectedSolutionId, justification.",
        'select',
        evaluatedSolutions
      );
    }
    return this.mcpClient.callTool('agent_select', {
      problem: problemDescription,
      evaluations: evaluatedSolutions,
    });
  }
}
