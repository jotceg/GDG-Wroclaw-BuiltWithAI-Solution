import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { Contradiction } from './contradiction.model';
import { Solution } from './solution.model';
import { Selection } from './selection.model';
import { User } from './user.model';
import { FiveWhysStep } from './five-whys-step.model';

@Table({ tableName: 'problems', underscored: true })
export class Problem extends Model<Problem> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  override id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  userId?: string;

  @BelongsTo(() => User)
  user?: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'PENDING',
  })
  status!: string;

  @HasOne(() => Contradiction)
  contradiction?: Contradiction;

  @HasMany(() => Solution)
  solutions?: Solution[];

  @HasMany(() => FiveWhysStep)
  fiveWhysSteps?: FiveWhysStep[];

  @HasOne(() => Selection)
  selection?: Selection;
}
