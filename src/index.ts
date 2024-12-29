import app from "./setup/express";
import { PORT } from "./setup/secrets";
import router from "./routes";
import { createServer } from 'http';
import { ErrorMiddleware } from "./middleware/error";
import { ConsoleLogger } from "./setup/logger";

const logger = new ConsoleLogger();
const errorMiddleware = new ErrorMiddleware(logger);

const server = createServer(app);

app.use('/v1', router);
app.use(errorMiddleware.errorHandler);

server.listen(PORT || 8080, () => {
    logger.debug(`Server started on port ${PORT || 8080}`)
})

export {
    app,
    server
};