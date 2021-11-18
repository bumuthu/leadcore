import { respondSuccess } from '../utils/response-generator';
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

// ScraperTriggerHandler
export const scraperTriggerHandler = async (event, _context) => {
    console.log("Payload:", event.body);

    const params = {
        FunctionName: "lq-scraper-dev1-ScrapInvocationHandler", // @TODO stage is to a variable
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: event.body
    };

    lambda.invoke(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });

    return respondSuccess({ message: "Scraping request submitted successfully", params });
}