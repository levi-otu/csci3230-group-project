import { DataTypes, Model } from 'sequelize'
import sequelize from '../db'


class Drawing extends Model {
  declare id: number
  declare userId: number
  declare sessionId: number
  declare imageData: Buffer
  declare imageMimeType: string
  declare fileName: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Drawing.init(
    {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        sessionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        imageData: {
            type: DataTypes.BLOB('long'),
            allowNull: false,
        },
        imageMimeType: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: 'image/png'
        },
        fileName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'drawings',
        timestamps: true, 
    }
)
export default Drawing
