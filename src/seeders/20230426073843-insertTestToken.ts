import { QueryInterface } from 'sequelize';

module.exports = {
    async up(queryInterface: QueryInterface) {
        return queryInterface.bulkInsert({ tableName: 'user' }, [
            {
                userName: 'Keagan',
                token: '8db596e286c5d6fff5e75a44e8a10c1cdf12127aa68a47b0ccb'
            }
        ]);
    },

    async down(queryInterface: QueryInterface) {
        return queryInterface.bulkDelete({ tableName: 'user' }, {});
    }
};