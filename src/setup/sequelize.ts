import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.NODE_ENV === 'test' ? ':memory:' : 'database.sqlite',
    logging: false,
});

sequelize.authenticate()
    .then(() => console.debug(`${process.pid}: Connection to database has been established successfully.`))
    .catch(error => console.error(`${process.pid}: Unable to connect to database - ${error}`))

export default sequelize;