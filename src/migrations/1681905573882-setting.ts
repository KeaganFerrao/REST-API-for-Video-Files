import { INTEGER, QueryInterface, QueryInterfaceCreateTableOptions } from 'sequelize';

module.exports = {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.createTable('setting', {
            id: {
                type: INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            maxSize: {
                type: INTEGER,
                allowNull: false
            },
            minSize: {
                type: INTEGER,
                allowNull: false
            },
            maxDuration: {
                type: INTEGER,
                allowNull: false
            },
            minDuration: {
                type: INTEGER,
                allowNull: false
            },
            linkExpiryInMin: {
                type: INTEGER,
                allowNull: false
            },
            maxVideoMergeCount: {
                type: INTEGER,
                allowNull: false
            }
        }, {
            tableName: 'setting',
            timestamps: false
        } as QueryInterfaceCreateTableOptions)
    },


    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable({
            tableName: 'setting'
        });
    }
};