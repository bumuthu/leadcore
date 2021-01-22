import CampaignController from './campaign/campaign.controller';
import 'dotenv/config';
import App from './app';
import AuthenticationController from './authentication/authentication.controller';
import ReportController from './report/report.controller';
import UserController from './user/user.controller';

const app = new App(
    [
        new CampaignController(),
        new AuthenticationController(),
        new UserController(),
        new ReportController(),
    ],
);

app.listen();
