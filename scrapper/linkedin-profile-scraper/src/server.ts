import App from './app';
import ProfileController from './controller/profile-controller';

const app = new App(new ProfileController());

app.listen();
