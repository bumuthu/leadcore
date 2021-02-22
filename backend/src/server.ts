import CampaignController from './controllers/campaign.controller';
import 'dotenv/config';
import App from './app';
import AuthenticationController from './controllers/authentication.controller';
import ReportController from './controllers/report.controller';
import UserController from './controllers/user.controller';
import CustomerController from './controllers/customer.controller';

const app = new App(
    [
        new CustomerController(),
        new CampaignController(),
        new AuthenticationController(),
        new UserController(),
        new ReportController(),
    ],
);

app.listen();
