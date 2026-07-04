import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Problem } from './problem.model';

@Table({ tableName: 'contradictions', underscored: true })
export class Contradiction extends Model<Contradiction> {
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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  improvingParamCode!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  improvingParamName!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  worseningParamCode!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  worseningParamName!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  explanation!: string;
}
