import express from 'express';
import config from 'config';
import bodyParser from 'body-parser';
import ProfileController from './controller/profile-controller';

class App {
    public static app: express.Application = express();;

    private constructor() { }

    public static listen() {

        App.initializeControllers();

        // const PORT = config.get('api.port')
        // App.app.listen(PORT, () => {
        //     console.log(`App listening on the port ${PORT}`);
        // });
    }

    public static initializeControllers() {
        const controller = new ProfileController();
        App.app.use(bodyParser.json());
        App.app.use('/', controller.router);
    }
}

export default App;
