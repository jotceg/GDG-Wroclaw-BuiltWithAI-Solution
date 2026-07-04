import { Injectable, Logger } from '@nestjs/common';
import { McpClientService } from './mcp-client.service';
import axios from 'axios';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly isOllama = process.env.LLM_PROVIDER === 'ollama';
  private readonly ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private readonly ollamaModel = process.env.OLLAMA_MODEL || 'llama3';

  constructor(private readonly mcpClient: McpClientService) {}

  private async callOllama<T>(prompt: string, systemInstruction: string, schema?: any): Promise<T> {
    this.logger.log(`Calling Ollama with prompt: ${prompt}`);
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
      this.logger.error(`Ollama failed: ${err.message}. Running Mock fallback.`);
      return this.mockFallback(prompt, schema);
    }
  }

  private mockFallback(prompt: string, schema: any): any {
    this.logger.warn(`Running Mock Fallback for prompt: ${prompt}`);
    if (prompt.includes('contradiction')) {
      return {
        improvingParamCode: 9,
        improvingParamName: 'Speed',
        worseningParamCode: 36,
        worseningParamName: 'Device complexity',
        explanation: '[MOCK] Increasing speed requires more complex components.'
      };
    }
    if (prompt.includes('Principles') || prompt.includes('TRIZ')) {
      return {
        solutions: [
          { title: '[MOCK] Pre-heating pipes', description: 'Pre-heat input pipes.', principleCode: '10', principleName: 'Prior Action' },
          { title: '[MOCK] Thermal coating', description: 'Apply dynamic paint.', principleCode: '32', principleName: 'Color change' },
          { title: '[MOCK] Flexible ducts', description: 'Use pneumatic ducting.', principleCode: '35', principleName: 'Parameter Change' }
        ]
      };
    }
    if (prompt.includes('History') || prompt.includes('Why')) {
      return {
        question: '[MOCK] Why do buildings need thermal insulation?',
        isAbuseOrOffTopic: false,
        suggestedHypothesis: '[MOCK] Using thermal mass could regulate heat.'
      };
    }
    if (prompt.includes('Root Cause') || prompt.includes('cause')) {
      return {
        solutions: [
          { title: '[MOCK] Countermeasure A', description: 'Fixes cause A.' },
          { title: '[MOCK] Countermeasure B', description: 'Fixes cause B.' },
          { title: '[MOCK] Countermeasure C', description: 'Fixes cause C.' }
        ]
      };
    }
    if (prompt.includes('Evaluate') || prompt.includes('evaluated') || prompt.includes('Candidates')) {
      return {
        evaluations: [
          { solutionId: 'sol-1', criterion: 'feasibility', score: 8, reasoning: 'Feasible.' },
          { solutionId: 'sol-1', criterion: 'impact', score: 7, reasoning: 'High impact.' },
          { solutionId: 'sol-1', criterion: 'cost', score: 6, reasoning: 'Moderate cost.' },
          { solutionId: 'sol-1', criterion: 'innovation', score: 9, reasoning: 'Very innovative.' }
        ]
      };
    }
    return {
      selectedSolutionId: 'sol-1',
      justification: '[MOCK] Selected candidate due to best overall balanced score.'
    };
  }

  async generateContradiction(problemDescription: string): Promise<{ improvingParamCode: number; improvingParamName: string; worseningParamCode: number; worseningParamName: string; explanation: string }> {
    if (this.isOllama) {
      return this.callOllama(
        `Identify the contradiction for: ${problemDescription}`,
        "You are a contradiction analyzer. Return JSON with keys: improvingParamCode (1-39), improvingParamName, worseningParamCode (1-39), worseningParamName, explanation."
      );
    }
    return this.mcpClient.callTool('agent_contradiction', { problem: problemDescription });
  }

  async generateTrizSolutions(problemDescription: string, principles: string[]): Promise<Array<{ title: string; description: string; principleCode: string; principleName: string }>> {
    if (this.isOllama) {
      const res = await this.callOllama<{ solutions: any[] }>(
        `Problem: ${problemDescription}. Principles: ${principles.join(', ')}`,
        "Return JSON with key 'solutions' containing objects with: title, description, principleCode, principleName."
      );
      return res.solutions;
    }
    const res = await this.mcpClient.callTool<{ solutions: any[] }>('agent_triz_solutions', {
      problem: problemDescription,
      principles,
    });
    return res.solutions;
  }

  async askNextWhy(problemDescription: string, history: Array<{ question: string; answer: string; kind: string; confirmed: boolean }>): Promise<{ question: string; isAbuseOrOffTopic: boolean; suggestedHypothesis?: string }> {
    if (this.isOllama) {
      return this.callOllama(
        `Problem: ${problemDescription}. History: ${JSON.stringify(history)}`,
        "You facilitate a 5 whys analysis. Return JSON with keys: question, isAbuseOrOffTopic, suggestedHypothesis."
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
        "Generate 3 countermeasures. Return JSON with key 'solutions' containing objects with: title, description."
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
        "Evaluate solutions. Return JSON with key 'evaluations' containing objects with: solutionId, criterion, score, reasoning."
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
        "Select the best. Return JSON with keys: selectedSolutionId, justification."
      );
    }
    return this.mcpClient.callTool('agent_select', {
      problem: problemDescription,
      evaluations: evaluatedSolutions,
    });
  }
}
