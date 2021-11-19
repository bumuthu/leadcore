import { ErrorCode } from 'src/utils/exceptions';
import { respondError, respondSuccess } from '../utils/response-generator';
const AWS = require('aws-sdk');

// AWS region
AWS.config.region = 'us-east-2';
const lambda = new AWS.Lambda();

// @TODO ARN is to be a variable
const lambdaArn = "arn:aws:lambda:us-east-2:001002431347:function:lq-scraper-dev1-ScrapHandler";

// ScraperTriggerHandler
export const scraperTriggerHandler = async (event, _context) => {
    const payload = JSON.parse(event.body);
    console.log("Payload:", payload);

    const params = {
        FunctionName: lambdaArn,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify({ body: payload })
    };

    try {
        lambda.invoke(params, function (err, data) {
            if (err) {
                console.log("ERROR:", err, err.stack);
                throw Error("Invocation failed")
            }
            else {
                console.log("SUCCESS:", data);
            }
        });
        return respondSuccess({ message: "Scraping request submitted successfully", params });
    } catch (e) {
        return respondError({ status: 400, code: ErrorCode.SCRAPER_INVOCATION_ERROR, message: `Failed to invoke lambda: [${lambdaArn}]` });
    }
}