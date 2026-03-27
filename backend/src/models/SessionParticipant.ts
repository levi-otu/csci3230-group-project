import { DataTypes, Model } from 'sequelize'
import sequelize from '../db'
import User from './User'
import Session from './Session'

class SessionParticipant extends Model {
  declare sessionId: number
  declare userId: number
  declare readonly joinedAt: Date
}

SessionParticipant.init(
  {
    sessionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'session_id',
      references: {
        model: Session,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'joined_at',
    },
  },
  {
    sequelize,
    tableName: 'session_participants',
    underscored: true,
    timestamps: false,
  }
)

Session.belongsToMany(User, { through: SessionParticipant, foreignKey: 'session_id', as: 'participants' })
User.belongsToMany(Session, { through: SessionParticipant, foreignKey: 'user_id', as: 'joinedSessions' })

export default SessionParticipant
