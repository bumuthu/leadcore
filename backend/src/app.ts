import cookieParser from 'cookie-parser';
import express from 'express';
import config from 'config';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import Controller from './utils/interfaces/controller.interface';
import errorMiddleware from './utils/middleware/error.middleware';

class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();

        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
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
        // this.app.use(cookieParser());
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/api/v1/', controller.router);
        });
    }

    private connectToTheDatabase() {
        const MONGO_PATH = config.get('database.path')

        mongoose.connect(MONGO_PATH, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(res => console.log('Connected to db'))
            .catch(err => console.log(err));
    }
}

export default App;
