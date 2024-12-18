import treeKill from "tree-kill";
import blockedHostsList from "../utils/blocked-hosts";
import { statusLog, getHostname } from "../utils/location";
import { SessionExpired } from "../utils/errors";
import { ScraperUserDefinedOptions, ScraperOptions } from "../utils/models";
import Chromium from "chrome-aws-lambda";
import { Browser, Page } from "../utils/puppeteer-import";

// const chromiumPath = "mnt/node/node_modules/puppeteer-core/.local-chromium/linux-901912/chrome-linux/chrome"; // Linux
// const chromiumPath = "D:/_LeadQuo/leadcore/scraper/node_modules/puppeteer-core/.local-chromium/win64-901912/chrome-win/chrome.exe" // Windows

export async function autoScroll(page: Page) {
  await page.evaluate(() => {
    return new Promise<void>((resolve, reject) => {
      var totalHeight = 0;
      var distance = 500;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  });
}

export default class InitLinkedInScraper {
  readonly options: ScraperOptions = {
    sessionCookieValue: "",
    keepAlive: false,
    timeout: 100000,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
    headless: true,
  };

  public browser: Browser | null = null;

  constructor(userDefinedOptions: ScraperUserDefinedOptions) {
    const logSection = "constructing";
    const errorPrefix = "Error during setup.";

    if (!userDefinedOptions.sessionCookieValue) {
      throw new Error(
        `${errorPrefix} Option "sessionCookieValue" is required.`
      );
    }

    if (
      userDefinedOptions.sessionCookieValue &&
      typeof userDefinedOptions.sessionCookieValue !== "string"
    ) {
      throw new Error(
        `${errorPrefix} Option "sessionCookieValue" needs to be a string.`
      );
    }

    if (
      userDefinedOptions.userAgent &&
      typeof userDefinedOptions.userAgent !== "string"
    ) {
      throw new Error(
        `${errorPrefix} Option "userAgent" needs to be a string.`
      );
    }

    if (
      userDefinedOptions.keepAlive !== undefined &&
      typeof userDefinedOptions.keepAlive !== "boolean"
    ) {
      throw new Error(
        `${errorPrefix} Option "keepAlive" needs to be a boolean.`
      );
    }

    if (
      userDefinedOptions.timeout !== undefined &&
      typeof userDefinedOptions.timeout !== "number"
    ) {
      throw new Error(`${errorPrefix} Option "timeout" needs to be a number.`);
    }

    if (
      userDefinedOptions.headless !== undefined &&
      typeof userDefinedOptions.headless !== "boolean"
    ) {
      throw new Error(
        `${errorPrefix} Option "headless" needs to be a boolean.`
      );
    }

    this.options = Object.assign(this.options, userDefinedOptions);

    statusLog(logSection, `Using options: ${JSON.stringify(this.options)}`);
  }

  /**
   * Method to load Puppeteer in memory so we can re-use the browser instance.
   */
  public setup = async () => {
    const logSection = "setup";

    try {
      statusLog(
        logSection,
        `Launching puppeteer in the ${this.options.headless ? "background" : "foreground"
        }...`
      );

      this.browser = await Chromium.puppeteer.launch({
        timeout: this.options.timeout,
        args: [
          ...(this.options.headless
            ? "---single-process"
            : "---start-maximized"),
          "--no-sandbox",
          "--disable-setuid-sandbox",
          ...Chromium.args
        ],
        defaultViewport: Chromium.defaultViewport,
        headless: this.options.headless,
        ignoreHTTPSErrors: true,
      });

      /*
      FLAGS in Chromium.args

        '--allow-running-insecure-content',
        '--autoplay-policy=user-gesture-required',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process',
        '--disable-print-preview',
        '--disable-setuid-sandbox',
        '--disable-site-isolation-trials',
        '--disable-speech-api',
        '--disable-web-security',
        '--disk-cache-size=33554432',
        '--enable-features=SharedArrayBuffer',
        '--hide-scrollbars',
        '--ignore-gpu-blocklist',
        '--in-process-gpu',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings',
        '--no-sandbox',
        '--no-zygote',
        '--use-gl=swiftshader',
        '--window-size=1920,1080',
        '--start-maximized'
      */

      statusLog(logSection, "Puppeteer launched!");

      await this.checkIfLoggedIn();

      statusLog(logSection, "Done!");
    } catch (err) {
      // Kill Puppeteer
      await this.close();

      statusLog(logSection, "An error occurred during setup.");

      throw err;
    }
  };

  /**
   * Create a Puppeteer page with some extra settings to speed up the crawling process.
   */
  public createPage = async (): Promise<Page> => {
    const logSection = "setup page";

    console.log("AAAA");

    if (!this.browser) {
      throw new Error("Browser not set.");
    }

    console.log("BBBB")

    // Important: Do not block "stylesheet", makes the crawler not work for LinkedIn
    const blockedResources = [
      "image",
      "media",
      "font",
      "texttrack",
      "object",
      "beacon",
      "csp_report",
      "imageset",
    ];

    try {
      console.log("CCCC")

      const page = await this.browser.newPage();

      // Use already open page
      // This makes sure we don't have an extra open tab consuming memory
      const firstPage = (await this.browser.pages())[0];
      await firstPage.close();

      console.log("DDDD")

      // Method to create a faster Page
      // From: https://github.com/shirshak55/scrapper-tools/blob/master/src/fastPage/index.ts#L113
      const session = await page.target().createCDPSession();
      await page.setBypassCSP(true);
      await session.send("Page.enable");
      await session.send("Page.setWebLifecycleState", {
        state: "active",
      });

      statusLog(
        logSection,
        `Blocking the following resources: ${blockedResources.join(", ")}`
      );

      // A list of hostnames that are trackers
      // By blocking those requests we can speed up the crawling
      // This is kinda what a normal adblocker does, but really simple
      const blockedHosts = this.getBlockedHosts();
      const blockedResourcesByHost = ["script", "xhr", "fetch", "document"];

      statusLog(
        logSection,
        `Should block scripts from ${Object.keys(blockedHosts).length
        } unwanted hosts to speed up the crawling.`
      );

      // Block loading of resources, like images and css, we dont need that
      await page.setRequestInterception(true);

      page.on("request", (req) => {
        if (blockedResources.includes(req.resourceType())) {
          return req.abort();
        }

        const hostname = getHostname(req.url());

        // Block all script requests from certain host names
        if (
          blockedResourcesByHost.includes(req.resourceType()) &&
          hostname &&
          blockedHosts[hostname] === true
        ) {
          statusLog(
            "blocked script",
            `${req.resourceType()}: ${hostname}: ${req.url()}`
          );
          return req.abort();
        }

        return req.continue();
      });

      await page.setUserAgent(this.options.userAgent);

      await page.setViewport({
        width: 1200,
        height: 720,
      });

      statusLog(
        logSection,
        `Setting session cookie using cookie: ${process.env.LINKEDIN_SESSION_COOKIE_VALUE}`
      );

      await page.setCookie({
        name: "li_at",
        value: this.options.sessionCookieValue,
        domain: ".www.linkedin.com",
      });

      statusLog(logSection, "Session cookie set!");

      statusLog(logSection, "Done!");

      return page;
    } catch (err) {
      // Kill Puppeteer
      await this.close();

      statusLog(logSection, "An error occurred during page setup.");
      statusLog(logSection, err.message);

      throw err;
    }
  };

  /**
   * Method to block know hosts that have some kind of tracking.
   * By blocking those hosts we speed up the crawling.
   *
   * More info: http://winhelp2002.mvps.org/hosts.htm
   */
  public getBlockedHosts = (): object => {
    const blockedHostsArray = blockedHostsList.split("\n");

    let blockedHostsObject = blockedHostsArray.reduce((prev, curr) => {
      const frags = curr.split(" ");

      if (frags.length > 1 && frags[0] === "0.0.0.0") {
        prev[frags[1].trim()] = true;
      }

      return prev;
    }, {});

    blockedHostsObject = {
      ...blockedHostsObject,
      "static.chartbeat.com": true,
      "scdn.cxense.com": true,
      "api.cxense.com": true,
      "www.googletagmanager.com": true,
      "connect.facebook.net": true,
      "platform.twitter.com": true,
      "tags.tiqcdn.com": true,
      "dev.visualwebsiteoptimizer.com": true,
      "smartlock.google.com": true,
      "cdn.embedly.com": true,
    };

    return blockedHostsObject;
  };

  /**
   * Method to complete kill any Puppeteer process still active.
   * Freeing up memory.
   */
  public close = (page?: Page): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      const loggerPrefix = "close";

      if (page) {
        try {
          statusLog(loggerPrefix, "Closing page...");
          await page.close();
          statusLog(loggerPrefix, "Closed page!");
        } catch (err) {
          reject(err);
        }
      }

      if (this.browser != null) {
        try {
          statusLog(loggerPrefix, "Closing browser...");
          await this.browser.close();
          statusLog(loggerPrefix, "Closed browser!");

          const browserProcessPid = this.browser.process()?.pid;

          // Completely kill the browser process to prevent zombie processes
          // https://docs.browserless.io/blog/2019/03/13/more-observations.html#tip-2-when-you-re-done-kill-it-with-fire
          if (browserProcessPid) {
            statusLog(
              loggerPrefix,
              `Killing browser process pid: ${browserProcessPid}...`
            );

            treeKill(browserProcessPid, "SIGKILL", (err) => {
              if (err) {
                return reject(
                  `Failed to kill browser process pid: ${browserProcessPid}`
                );
              }

              statusLog(
                loggerPrefix,
                `Killed browser pid: ${browserProcessPid} Closed browser.`
              );
              resolve();
            });
          }
        } catch (err) {
          reject(err);
        }
      }

      return resolve();
    });
  };

  /**
   * Simple method to check if the session is still active.
   */
  public checkIfLoggedIn = async () => {
    const logSection = "checkIfLoggedIn";

    const page = await this.createPage();

    statusLog(logSection, "Checking if we are still logged in...");

    // Go to the login page of LinkedIn
    // If we do not get redirected and stay on /login, we are logged out
    // If we get redirect to /feed, we are logged in
    await page.goto("https://www.linkedin.com/login", {
      waitUntil: "networkidle2",
      timeout: this.options.timeout,
    });

    const url = page.url();

    const isLoggedIn = !url.endsWith("/login");

    await page.close();

    if (isLoggedIn) {
      statusLog(logSection, "All good. We are still logged in.");
    } else {
      const errorMessage =
        'Bad news, we are not logged in! Your session seems to be expired. Use your browser to login again with your LinkedIn credentials and extract the "li_at" cookie value for the "sessionCookieValue" option.';
      statusLog(logSection, errorMessage);
      throw new SessionExpired(errorMessage);
    }
  };
}
