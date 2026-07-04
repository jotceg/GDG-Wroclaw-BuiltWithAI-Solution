import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Problem } from './problem.model';

@Table({ tableName: 'users', underscored: true })
export class User extends Model<User> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  override id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  passwordHash!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  name?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'client',
  })
  role!: string;

  @HasMany(() => Problem)
  problems?: Problem[];
}
