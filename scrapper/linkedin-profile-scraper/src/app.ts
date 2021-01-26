import express from 'express';
import config from 'config';
import bodyParser from 'body-parser';
import ProfileController from './controller/profile-controller';

class App {
    public app: express.Application;

    constructor(controller: ProfileController) {
        this.app = express();
        this.initializeControllers(controller);
    }

    public listen() {
        const PORT = config.get('api.port')
        this.app.listen(PORT, () => {
            console.log(`App listening on the port ${PORT}`);
        });
    }

    private initializeControllers(controller: ProfileController) {
        this.app.use(bodyParser.json());
        this.app.use('/', controller.router);
    }
}

export default App;
