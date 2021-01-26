import { Router } from 'express';
import Controller from './controller-interface';
import { LinkedInProfileScraper } from '../scraper/profile-scraper';
import { LinkedInSearchScraper } from '../scraper/search-scraper';

export default class ProfileController implements Controller {
    public path = '/profile';
    public router = Router();

    constructor() {
        this.router.post(this.path + '/single', this.scrapeProfile)
        this.router.post(this.path + '/search', this.searchProfiles)
    }

    async scrapeProfile(req, res) {

        const scraper = new LinkedInProfileScraper({
            sessionCookieValue: req.body.sessionToken,
            keepAlive: false,
          })
        
          await scraper.scraper.setup()        
          const result = await scraper.run(req.body.profileUrl)

          res.send(result);
          res.sendStatus(200); 
          
          await scraper.scraper.close()
    }

    async searchProfiles(req, res) {

        const scraper = new LinkedInSearchScraper({
            sessionCookieValue: req.body.sessionToken,
            keepAlive: false,
          })
        
          await scraper.scraper.setup()        
          const result = await scraper.run(req.body.searchUrl)

          res.send(result);   
          res.sendStatus(200); 
          
          await scraper.scraper.close()
    }
}
