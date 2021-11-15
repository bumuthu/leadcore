import { respondSuccess } from "src/utils/response-generator"
import { send } from "src/utils/websocket";

// ScapperWSHandler
export const scraperHandler = async (event, _context) => {
    console.log("Event:", event);

    const message = JSON.parse(event.body);
    const connectionId = event.requestContext.connectionId
    const endpoint = event.requestContext.domainName + '/' + event.requestContext.stage

    await send(endpoint, connectionId, { message: "Hi 1", endpoint, connectionId })
    await send(endpoint, connectionId, { message: "Hi 2", endpoint, connectionId })
    await send(endpoint, connectionId, { message: "Hi 3", endpoint, connectionId })

    return respondSuccess(message);
}