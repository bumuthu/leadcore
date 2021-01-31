import { LinkedInProfileScraper } from '../scraper/profile-scraper';
import config from 'config';

(async () => {
  const scraper = new LinkedInProfileScraper({
    sessionCookieValue: config.get("linkedin.session-token"),
    keepAlive: false,
  })

  await scraper.scraper.setup()

  const result = await scraper.run(config.get("scrapping.profile-url"))
  
  console.log("Response for "+ config.get("scrapping.profile-url") + "="+ JSON.stringify(result))
  
})()

