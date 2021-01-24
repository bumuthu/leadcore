import InitLinkedInScraper from "./init-scraper";
import { statusLog } from "./utils/location";
import { autoScroll } from "./init-scraper";
import { SearchProfile, ScraperUserDefinedOptions } from "./utils/models";

export class LinkedInSearchScraper {
  public scraper: InitLinkedInScraper;

  constructor(userDefinedOptions: ScraperUserDefinedOptions) {
    this.scraper = new InitLinkedInScraper(userDefinedOptions);
  }

  public run = async (searchUrl: string) => {
    const logSection = "run";
    const limit: number = 1;

    const scraperSessionId = new Date().getTime();

    if (!this.scraper.browser) {
      throw new Error("Browser is not set. Please run the setup method first.");
    }

    if (!searchUrl) {
      throw new Error("No searchUrl given.");
    }

    if (!searchUrl.includes("linkedin.com/")) {
      throw new Error("The given URL to scrape is not a linkedin.com url.");
    }

    try {
      // Eeach run has it's own page
      const page = await this.scraper.createPage();

      statusLog(
        logSection,
        `Navigating to LinkedIn profile: ${searchUrl}`,
        scraperSessionId
      );

      await page.goto(searchUrl, {
        // Use "networkidl2" here and not "domcontentloaded".
        // As with "domcontentloaded" some elements might not be loaded correctly, resulting in missing data.
        waitUntil: "networkidle2",
        timeout: this.scraper.options.timeout,
      });

      statusLog(logSection, "LinkedIn profile page loaded!", scraperSessionId);

      statusLog(
        logSection,
        "Getting all the LinkedIn profile data by scrolling the page to the bottom, so all the data gets loaded into the page...",
        scraperSessionId
      );

      statusLog(logSection, "Parsing data...", scraperSessionId);

      async function getLinkedInSearch(searchAllSelection, count) {
        const searchProfiles: SearchProfile[] = [];
        let upperLimit = (count + 1) * 10;

        if (upperLimit > limit) {
          searchAllSelection = searchAllSelection.slice(0, limit % 10);
        }
        for (let prof of searchAllSelection) {
          const name = await prof.$eval(
            ".actor-name",
            (name) => name?.textContent
          );

          const title = await prof.$eval(
            ".t-black.search-result__truncate",
            (title) => title?.textContent?.trim()
          );

          const order = await prof.$eval(
            ".dist-value",
            (order) => order?.textContent
          );

          const link = await prof.$eval("a", (link) => link?.href);

          searchProfiles.push({
            name: name,
            title: title,
            order: order,
            link: link,
          });
        }

        return searchProfiles;
      }

      let count: number = 0;
      let doesNextExist: boolean = true;

      let allLinkedInSearch: SearchProfile[] = [];

      while (doesNextExist && count < Math.ceil(limit / 10)) {
        await autoScroll(page);

        await page.waitForSelector(".search-result__wrapper");
        let searchAllSelection = await page.$$(".search-result__wrapper");

        allLinkedInSearch = allLinkedInSearch.concat(
          await getLinkedInSearch(searchAllSelection, count)
        );

        let nextSelector = "#ember53 .artdeco-button--tertiary";

        await page.waitForSelector(nextSelector);
        let nextSelection = (await page.$$(nextSelector))[1];

        count += 1;

        if (!nextSelection["disabled"] && count < Math.ceil(limit / 10)) {
          statusLog(
            logSection,
            `Clicking next button ${nextSelector}`,
            scraperSessionId
          );
          await nextSelection["click"]();
        } else {
          doesNextExist = false;
        }
      }

      console.log(allLinkedInSearch);
      console.log("length : ", allLinkedInSearch.length);
    } catch (err) {
      // Kill Puppeteer
      await this.scraper.close();

      statusLog(logSection, "An error occurred during a run.");

      // Throw the error up, allowing the user to handle this error himself.
      throw err;
    }
  };
}
