import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../setup/sequelize';
import { VideoAttributes } from './video';

export interface LinkAttributes {
    id: number;
    videoId: number;
    expiryTime: Date | null;
    generatedOn: Date;
    uniqueId: string;
    video?: VideoAttributes;
}

export interface LinkCreationAttributes extends Optional<LinkAttributes, 'id'> { }

export interface LinkInstance
    extends Model<LinkAttributes, LinkCreationAttributes>,
    LinkAttributes {
}

const link = sequelize.define<LinkInstance>(
    'link',
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
        videoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'video',
                key: 'id'
            }
        },
        expiryTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        generatedOn: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        tableName: 'link',
        timestamps: false,
    }
);

export default link;
