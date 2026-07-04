import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Solution } from './solution.model';

@Table({ tableName: 'evaluations', underscored: true })
export class Evaluation extends Model<Evaluation> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  override id!: string;

  @ForeignKey(() => Solution)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  solutionId!: string;

  @BelongsTo(() => Solution)
  solution!: Solution;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  criterion!: string; // 'feasibility', 'impact', 'cost', 'innovation'

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  score!: number; // 1-10

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  reasoning!: string;
}
