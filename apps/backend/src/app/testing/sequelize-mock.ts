import { Provider } from '@nestjs/common';

// Note: We define a local placeholder for getModelToken in case @nestjs/sequelize isn't installed yet
// This prevents compile errors until the package is fully installed.
export const getModelToken = (model: any): string => {
  return `${model.name}Repository`;
};

/**
 * Creates a mocked version of a Sequelize model with common operations stubbed as Jest mock functions.
 */
export const createMockModel = <T = any>() => {
  const mock = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn(),
    build: jest.fn().mockImplementation((attrs) => ({
      ...attrs,
      save: jest.fn().mockResolvedValue(attrs),
      update: jest.fn().mockResolvedValue(attrs),
      destroy: jest.fn().mockResolvedValue(true),
    })),
    upsert: jest.fn(),
    count: jest.fn(),
  };
  return mock;
};

/**
 * Creates a NestJS provider that provides a mocked Sequelize model.
 * 
 * @param model The Sequelize Model class to mock
 * @returns A Provider object configuration for Test.createTestingModule
 */
export const provideMockModel = (model: any): Provider => {
  return {
    provide: getModelToken(model),
    useValue: createMockModel(),
  };
};
