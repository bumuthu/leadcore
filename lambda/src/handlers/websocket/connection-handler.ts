import { respondSuccess } from "src/utils/response-generator"

// WSConnectionHandler
export const connectionHandler = async (event, _context) => {
    console.log("Event:", event);
    
    return respondSuccess({ message: "Connected Successfully"})
}