import { LinkedInSearchScraper } from '../search-scraper';

(async () => {
  const scraper = new LinkedInSearchScraper({
    sessionCookieValue: "AQEDASO2tVQCq2umAAABdX9zsrYAAAF1o4A2tlYAvrZzrb9Lowa8rin56bwSjtktVXffjbabJtt8Jdk-9CS1lp4qkWth545_gnVwYWuxktLK2ffHrY7WRJyp0cq4kREkeWCOYNknGNDln8GCYFFRr6jW",
    keepAlive: false,
  })

  await scraper.scraper.setup()

  await scraper.run('https://www.linkedin.com/search/results/all/?keywords=john&origin=GLOBAL_SEARCH_HEADER')
  
})()

