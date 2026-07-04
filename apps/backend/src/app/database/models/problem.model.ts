import { Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { Contradiction } from './contradiction.model';
import { Solution } from './solution.model';
import { Selection } from './selection.model';

@Table({ tableName: 'problems', underscored: true })
export class Problem extends Model<Problem> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  override id!: string;

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

  @HasOne(() => Selection)
  selection?: Selection;
}
