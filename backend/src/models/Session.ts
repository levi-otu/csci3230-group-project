import { DataTypes, Model } from 'sequelize'
import sequelize from '../db'
import User from './User'

class Session extends Model {
  declare id: number
  declare title: string
  declare description: string | null
  declare createdBy: number
  declare status: 'active' | 'completed' | 'cancelled'
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Session.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by',
      references: {
        model: User,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'sessions',
    underscored: true,
  }
)

Session.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })
User.hasMany(Session, { foreignKey: 'created_by', as: 'sessions' })

export default Session
