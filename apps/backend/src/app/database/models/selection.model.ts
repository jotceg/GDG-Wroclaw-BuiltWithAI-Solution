import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Problem } from './problem.model';
import { Solution } from './solution.model';

@Table({ tableName: 'selections', underscored: true })
export class Selection extends Model<Selection> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  override id!: string;

  @ForeignKey(() => Problem)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  problemId!: string;

  @BelongsTo(() => Problem)
  problem!: Problem;

  @ForeignKey(() => Solution)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  selectedSolutionId!: string;

  @BelongsTo(() => Solution)
  selectedSolution!: Solution;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  justification!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  fullTrailJson!: any;
}
