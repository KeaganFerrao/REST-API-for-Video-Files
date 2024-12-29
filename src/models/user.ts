import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../setup/sequelize';

export interface UserAttributes {
    id: number;
    userName: string;
    token: string;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

export interface UserInstance
    extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes { }

const user = sequelize.define<UserInstance>(
    'user',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        token: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    },
    {
        tableName: 'user',
        timestamps: false,
    }
);

export default user;
