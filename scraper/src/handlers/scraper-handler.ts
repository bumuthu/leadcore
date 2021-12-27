import { LinkedInProfileScraper } from '../scraper/profile-scraper';
import { respondSuccess } from '../utils/response-generator';
import { send } from '../utils/websocket';

export const endpoint = "ws-api.leadquo.com/dev1"

// ScrapHandler
export const scraperHandler = async (event, _context) => {
    console.log("Event:", event);

    const message = event.body;
    const connectionId = message.connectionId;

    await send(endpoint, connectionId, { message: "Srapping request recieved" })

    const scraper = new LinkedInProfileScraper({
        sessionCookieValue: message.sessionToken,
        keepAlive: false,
    })

    await send(endpoint, connectionId, { message: "Setting up started" })
    await scraper.scraper.setup()
    await send(endpoint, connectionId, { message: "Setting up done" })

    await send(endpoint, connectionId, { message: "Scraper started" })
    const result = await scraper.run(message.profileUrl)

    await send(endpoint, connectionId, { message: "Scraping done", profileUrl: message.profileUrl, result })
    console.log("Response for " + message.profileUrl + " = " + JSON.stringify(result));

    return respondSuccess(result);
}