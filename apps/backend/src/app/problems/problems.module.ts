import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';
import { LlmService } from './llm.service';
import { McpClientService } from './mcp-client.service';
import { Problem, Contradiction, Solution, Evaluation, Selection, FiveWhysStep, User } from '../database/models';

@Module({
  imports: [
    SequelizeModule.forFeature([Problem, Contradiction, Solution, Evaluation, Selection, FiveWhysStep, User]),
  ],
  controllers: [ProblemsController],
  providers: [ProblemsService, LlmService, McpClientService],
  exports: [ProblemsService],
})
export class ProblemsModule {}
