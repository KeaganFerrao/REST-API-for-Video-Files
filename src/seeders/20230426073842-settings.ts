import { QueryInterface } from 'sequelize';

module.exports = {
    async up(queryInterface: QueryInterface) {
        return queryInterface.bulkInsert({ tableName: 'setting' }, [
            {
                maxSize: 100000,
                minSize: 100,
                maxDuration: 600,
                minDuration: 10,
                linkExpiryInMin: 2,
                maxVideoMergeCount: 4
            }
        ]);
    },

    async down(queryInterface: QueryInterface) {
        return queryInterface.bulkDelete({ tableName: 'setting' }, {});
    }
};