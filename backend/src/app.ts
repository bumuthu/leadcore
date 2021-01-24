import cookieParser from 'cookie-parser';
import express from 'express';
import config from 'config';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import Controller from './utils/interfaces/controller.interface';
import errorMiddleware from './utils/middleware/error.middleware';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from "swagger-ui-express";

class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();

        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
        this.setupSwagger();
    }

    public listen() {
        const PORT = config.get('api.port')
        this.app.listen(PORT, () => {
            console.log(`App listening on the port ${PORT}`);
        });
    }

    public getServer() {
        return this.app;
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private connectToTheDatabase() {
        const MONGO_PATH = config.get('database.path')
        mongoose.connect(`mongodb://${MONGO_PATH}`);
    }

    private setupSwagger() {
        const swaggerOptions = {
            swaggerDefinition: {
                info: {
                    version: "1.0.0",
                    title: "Customer API",
                    description: "Customer API Information",
                    contact: {
                        name: "Amazing Developer"
                    },
                    servers: ["http://localhost:5000"]
                }
            },
            // ['.routes/*.js']
            apis: ["./**/*.controller.ts"]
        };

        const swaggerDocs = swaggerJSDoc(swaggerOptions);
        this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    }
}

export default App;
