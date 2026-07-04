import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Problem } from './problem.model';

@Table({ tableName: 'five_whys_steps', underscored: true })
export class FiveWhysStep extends Model<FiveWhysStep> {
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
    type: DataType.INTEGER,
    allowNull: false,
  })
  depth!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  question!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  answer?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'answer',
  })
  kind!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  confirmed!: boolean;
}
