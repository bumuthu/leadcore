------
# LinkedIn Profile Scraper

## Usage
Reference: ```https://github.com/jvandenaardweg/linkedin-profile-scraper/```

## Useful links to up and running ubuntu
```
https://medium.com/@ssmak/how-to-fix-puppetteer-error-while-loading-shared-libraries-libx11-xcb-so-1-c1918b75acc3

https://github.com/actions/virtual-environments/issues/732

```

### About using the session cookie
This module uses the session cookie of a succesfull login into LinkedIn, instead of an e-mail and password to set you logged-in. I did this because LinkedIn has security measures by blocking login requests from unknown locations or requiring you to fill in Captcha's upon login. So, if you run this from a server and try to login with an e-mail address and password, your login could be blocked. By using a known session, we prevent this from happening and allows you to use this scraper on any server on any location.

So, using a session cookie is the most reliable way that I currently know.

You probably need to follow the setup steps when the scraper logs show it's not logged-in anymore.

### About the performance
- Upon start the module will open a headless browser session using Chromium. That session could be kept alive using the `keepAlive` option. Chromium uses about 75MB memory when in idle.
- Scraping usually takes a few seconds, because the script needs to scroll through the page and expand several elements in order for all the data to appear.

### Usage limits
LinkedIn has some usage limits in place. Please respect those and use their options to increase limits. More info: [LinkedIn Commercial Use Limit](https://www.linkedin.com/help/linkedin/answer/52950)
