import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Post()
  async create(@Body('description') description: string) {
    return this.problemsService.create(description);
  }

  @Post(':id/contradiction')
  async reformulateContradiction(@Param('id') id: string) {
    return this.problemsService.reformulateContradiction(id);
  }

  @Post(':id/solutions/triz')
  async generateTrizSolutions(@Param('id') id: string) {
    return this.problemsService.generateTrizSolutions(id);
  }

  @Post(':id/fivewhys/next')
  async fiveWhysNext(@Param('id') id: string) {
    return this.problemsService.fiveWhysNext(id);
  }

  @Post(':id/fivewhys/answer')
  async fiveWhysAnswer(
    @Param('id') id: string,
    @Body('answer') answer: string,
    @Body('kind') kind?: string,
    @Body('confirmed') confirmed?: boolean
  ) {
    return this.problemsService.fiveWhysAnswer(id, answer, kind, confirmed);
  }

  @Post(':id/solutions/fivewhys')
  async generateFiveWhysSolutions(@Param('id') id: string) {
    return this.problemsService.generateFiveWhysSolutions(id);
  }

  @Post(':id/evaluate')
  async evaluateCandidates(@Param('id') id: string) {
    return this.problemsService.evaluateCandidates(id);
  }

  @Post(':id/select')
  async selectCandidate(@Param('id') id: string) {
    return this.problemsService.selectCandidate(id);
  }

  @Get(':id/trail')
  async getTrail(@Param('id') id: string) {
    return this.problemsService.getTrail(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.problemsService.findOne(id);
  }

  @Get()
  async findAll() {
    return this.problemsService.findAll();
  }
}
