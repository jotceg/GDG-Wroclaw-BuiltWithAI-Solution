import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class McpClientService {
  private readonly logger = new Logger(McpClientService.name);
  private readonly baseUrl = process.env.MCP_SERVER_URL || 'http://localhost:8123';

  async callTool<T = any>(toolName: string, args: Record<string, any>): Promise<T> {
    try {
      this.logger.log(`Calling MCP tool "${toolName}" with args: ${JSON.stringify(args)}`);
      const response = await axios.post(`${this.baseUrl}/tools/${toolName}`, {
        arguments: args,
      });

      const content = response.data?.content;
      if (!content || !content.length) {
        throw new Error(`Invalid response from MCP tool "${toolName}": no content`);
      }

      const textContent = content[0].text;
      try {
        // If the agent returned structured JSON, parse it
        return JSON.parse(textContent) as T;
      } catch {
        // Otherwise return as raw text
        return textContent as unknown as T;
      }
    } catch (error: any) {
      this.logger.error(
        `Error calling MCP tool "${toolName}": ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`
      );
      throw error;
    }
  }

  async searchParameter(query: string): Promise<string> {
    return this.callTool<string>('search_parameter', { query });
  }

  async browseContradictionMatrix(improving: number, worsening: number): Promise<string> {
    return this.callTool<string>('browse_contradiction_matrix', {
      improving_params: [improving],
      preserving_params: [worsening],
    });
  }
}
