import { Injectable, NotFoundException } from '@nestjs/common';

export interface Problem {
  id: string;
  description: string;
  status: string;
  createdAt: Date;
}

@Injectable()
export class ProblemsService {
  // In-memory or Sequelize placeholder for demo/scaffold
  private problems: Map<string, Problem> = new Map();

  async create(description: string): Promise<Problem> {
    const problem: Problem = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      status: 'PENDING',
      createdAt: new Date(),
    };
    this.problems.set(problem.id, problem);
    return problem;
  }

  async findOne(id: string): Promise<Problem> {
    const problem = this.problems.get(id);
    if (!problem) {
      throw new NotFoundException(`Problem with ID "${id}" not found`);
    }
    return problem;
  }

  async findAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }
}
