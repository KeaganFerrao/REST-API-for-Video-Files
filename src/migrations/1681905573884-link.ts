import { DATE, INTEGER, QueryInterface, QueryInterfaceCreateTableOptions, STRING } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.createTable('link', {
            id: {
                type: INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            uniqueId: {
                type: STRING(255),
                allowNull: false,
                unique: true
            },
            videoId: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: 'video',
                    key: 'id'
                }
            },
            expiryTime: {
                type: DATE,
                allowNull: true
            },
            generatedOn: {
                type: DATE,
                allowNull: false
            }
        }, {
            tableName: 'link',
            timestamps: false
        } as QueryInterfaceCreateTableOptions)

        await queryInterface.addConstraint('link', {
            fields: ['videoId'],
            type: 'foreign key',
            name: 'link_videoId_fkey',
            references: {
                table: 'video',
                field: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
    },


    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable({
            tableName: 'link'
        });
    }
};