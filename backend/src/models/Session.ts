import { DataTypes, Model } from 'sequelize'
import sequelize from '../db'
import User from './User'

class Session extends Model {
  declare id: number
  declare title: string
  declare description: string | null
  declare topic: string
  declare createdBy: number
  declare scheduledAt: Date
  declare durationMinutes: number
  declare maxParticipants: number | null
  declare status: 'scheduled' | 'active' | 'completed' | 'cancelled'
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
    topic: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'General',
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
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'scheduled_at',
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      field: 'duration_minutes',
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'max_participants',
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled',
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
