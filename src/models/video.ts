import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../setup/sequelize';

export interface VideoAttributes {
    id: number;
    uniqueId: string;
    fileName: string;
    uploadedOn: Date;
    duration?: number | null;
    extension: string;
    mimeType: string;
}

export interface VideoCreationAttributes extends Optional<VideoAttributes, 'id'> { }

export interface VideoInstance
    extends Model<VideoAttributes, VideoCreationAttributes>,
    VideoAttributes { }

const video = sequelize.define<VideoInstance>(
    'video',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        uniqueId: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        fileName: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        uploadedOn: {
            type: DataTypes.DATE,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        extension: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        mimeType: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    },
    {
        tableName: 'video',
        timestamps: false,
    }
);

export default video;
