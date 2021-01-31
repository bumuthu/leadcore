import CampaignController from './campaign/campaign.controller';
import 'dotenv/config';
import App from './app';
import AuthenticationController from './authentication/authentication.controller';
import ReportController from './report/report.controller';
import UserController from './user/user.controller';
import CustomerController from './customer/customer.controller';

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
