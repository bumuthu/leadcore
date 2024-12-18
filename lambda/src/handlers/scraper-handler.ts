import { ErrorCode } from 'src/utils/exceptions';
import { respondError, respondSuccess } from '../utils/response-generator';
const AWS = require('aws-sdk');

// AWS region
const lambda = new AWS.Lambda();

// @TODO ARN is to be a variable
const lambdaArn = "arn:aws:lambda:us-east-2:001002431347:function:lq-test-scraper";

// ScraperTriggerHandler
export const scraperTriggerHandler = async (event, _context) => {
    const payload = JSON.parse(event.body);
    console.log("Payload:", payload);

    const params = {
        FunctionName: lambdaArn,
        // InvocationType: 'RequestResponse',
        // LogType: 'Tail',
        InvokeArgs: JSON.stringify({ body: payload })
    };

    try {
        const startTime = Date.now();
        lambda.invokeAsync(params, function (err, data) {
            if (err) {
                console.log("ERROR:", err, err.stack);
                throw Error("Invocation failed")
            }
            else {
                const endTime = Date.now();
                console.log("SUCCESS:", data);
                console.log("Time to invoke:", endTime - startTime)
            }
        });
        await new Promise(resolve => setTimeout(resolve, 5000))

        return respondSuccess({ message: "Scraping request submitted successfully", params });
    } catch (e) {
        return respondError({ status: 400, code: ErrorCode.SCRAPER_INVOCATION_ERROR, message: `Failed to invoke lambda: [${lambdaArn}]` });
    }
}