import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../setup/sequelize';

export interface SettingAttributes {
    id: number;
    maxSize: number;
    minSize: number;
    maxDuration: number;
    minDuration: number;
    linkExpiryInMin: number;
    maxVideoMergeCount: number;
}

export interface SettingCreationAttributes extends Optional<SettingAttributes, 'id'> { }

export interface SettingInstance
    extends Model<SettingAttributes, SettingCreationAttributes>,
    SettingAttributes { }

const setting = sequelize.define<SettingInstance>(
    'setting',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        maxSize: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        minSize: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        maxDuration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        minDuration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        linkExpiryInMin: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        maxVideoMergeCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: 'setting',
        timestamps: false,
    }
);

export default setting;
