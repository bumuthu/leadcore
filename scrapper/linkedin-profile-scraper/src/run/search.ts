import { LinkedInSearchScraper } from '../scraper/search-scraper';
import config from 'config';

(async () => {
  const scraper = new LinkedInSearchScraper({
    sessionCookieValue: config.get("linkedin.session-token"),
    keepAlive: false,
  })

  await scraper.scraper.setup()

  await scraper.run(config.get("scrapping.search-url"))
  
})()

