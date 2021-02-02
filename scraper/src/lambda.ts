import AwsServerlessExpress from 'aws-serverless-express';
import App from './app';

App.listen();

const server = AwsServerlessExpress.createServer(App.app)

export const universal = (event, context) => {AwsServerlessExpress.proxy(server, event, context)}
