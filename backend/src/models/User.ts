import { DataTypes, Model } from 'sequelize'
import sequelize from '../db'

class User extends Model {
  declare id: number
  declare username: string
  declare email: string
  declare passwordHash: string
  declare role: 'admin' | 'instructor' | 'student'
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    role: {
      type: DataTypes.ENUM('admin', 'instructor', 'student'),
      allowNull: false,
      defaultValue: 'student',
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
  }
)

export default User
