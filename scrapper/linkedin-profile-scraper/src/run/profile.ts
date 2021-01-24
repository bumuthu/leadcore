import { LinkedInProfileScraper } from '../profile-scraper';

(async () => {
  const scraper = new LinkedInProfileScraper({
    sessionCookieValue: "AQEDASO2tVQCq2umAAABdX9zsrYAAAF1o4A2tlYAvrZzrb9Lowa8rin56bwSjtktVXffjbabJtt8Jdk-9CS1lp4qkWth545_gnVwYWuxktLK2ffHrY7WRJyp0cq4kREkeWCOYNknGNDln8GCYFFRr6jW",
    keepAlive: false,
  })

  await scraper.scraper.setup()

  const result = await scraper.run('https://www.linkedin.com/in/anna-zimmermann-madureira-5baa7742/')
  
  console.log(result)
  
})()

