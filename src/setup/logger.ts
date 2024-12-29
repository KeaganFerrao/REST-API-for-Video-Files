import { Logger } from "../interfaces/api";

export class ConsoleLogger implements Logger {
    debug(message: string): void {
        console.log(message);
    }

    error(message: string): void {
        console.error(message);
    }

    info(message: string): void {
        console.info(message);
    }
}