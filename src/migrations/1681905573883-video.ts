import { DATE, INTEGER, QueryInterface, QueryInterfaceCreateTableOptions, STRING } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.createTable('video', {
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
            fileName: {
                type: STRING(255),
                allowNull: false
            },
            uploadedOn: {
                type: DATE,
                allowNull: false
            },
            duration: {
                type: INTEGER,
                allowNull: true
            },
            extension: {
                type: STRING(10),
                allowNull: false
            },
            mimeType: {
                type: STRING(255),
                allowNull: false
            }
        }, {
            tableName: 'video',
            timestamps: false
        } as QueryInterfaceCreateTableOptions)
    },


    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable({
            tableName: 'video'
        });
    }
};