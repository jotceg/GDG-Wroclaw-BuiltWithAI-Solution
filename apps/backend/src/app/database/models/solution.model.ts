import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Problem } from './problem.model';
import { Evaluation } from './evaluation.model';

@Table({ tableName: 'solutions', underscored: true })
export class Solution extends Model<Solution> {
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
  })
  problemId!: string;

  @BelongsTo(() => Problem)
  problem!: Problem;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  method!: string; // 'triz' or 'alternative' (e.g. biomimicry)

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  principleCode?: string; // e.g. '10' or 'M'

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  principleName?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @HasMany(() => Evaluation)
  evaluations?: Evaluation[];
}
