import { respondSuccess } from "src/utils/response-generator"
import { send } from "src/utils/websocket";

// ScapperConnectionHandler
export const scraperConnectionHandler = async (event, _context) => {
    console.log("Event:", event);

    const message = JSON.parse(event.body);
    const connectionId = event.requestContext.connectionId
    const endpoint = event.requestContext.domainName + '/' + event.requestContext.stage

    await send(endpoint, connectionId, { message: "[scrap] connection started", endpoint, connectionId })

    return respondSuccess(message);
}