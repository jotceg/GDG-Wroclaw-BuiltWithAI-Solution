import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Problem, Contradiction, Solution, Evaluation, Selection, User, FiveWhysStep } from './database/models';
import { ProblemsModule } from './problems/problems.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [Problem, Contradiction, Solution, Evaluation, Selection, User, FiveWhysStep],
      autoLoadModels: true,
      synchronize: true,
      sync: { alter: true },
    }),
    ProblemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
