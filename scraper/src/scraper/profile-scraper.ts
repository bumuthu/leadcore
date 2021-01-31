import InitLinkedInScraper from "./init-scraper";
import { autoScroll } from "./init-scraper";
import {
  getDurationInDays,
  formatDate,
  getCleanText,
  getLocationFromText,
  statusLog,
} from "../utils/location";
import {
  RawProfile,
  RawExperience,
  RawEducation,
  RawVolunteerExperience,
  Skill,
  Experience,
  Profile,
  VolunteerExperience,
  Education,
} from "../utils/models";
import { ScraperUserDefinedOptions } from "../utils/models";

export class LinkedInProfileScraper {
  public scraper: InitLinkedInScraper;

  constructor(userDefinedOptions: ScraperUserDefinedOptions) {
    this.scraper = new InitLinkedInScraper(userDefinedOptions);
  }

  public run = async (profileUrl: string) => {
    const logSection = "run";

    const scraperSessionId = new Date().getTime();

    if (!this.scraper.browser) {
      throw new Error("Browser is not set. Please run the setup method first.");
    }

    if (!profileUrl) {
      throw new Error("No profileUrl given.");
    }

    if (!profileUrl.includes("linkedin.com/")) {
      throw new Error("The given URL to scrape is not a linkedin.com url.");
    }

    try {
      // Eeach run has it's own page
      const page = await this.scraper.createPage();

      statusLog(
        logSection,
        `Navigating to LinkedIn profile: ${profileUrl}`,
        scraperSessionId
      );

      await page.goto(profileUrl, {
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

      await autoScroll(page);

      statusLog(logSection, "Parsing data...", scraperSessionId);

      // Only click the expanding buttons when they exist
      const expandButtonsSelectors = [
        ".pv-profile-section.pv-about-section .lt-line-clamp__more", // About
        "#experience-section .pv-profile-section__see-more-inline.link", // Experience
        ".pv-profile-section.education-section button.pv-profile-section__see-more-inline", // Education
        '.pv-skill-categories-section [data-control-name="skill_details"]', // Skills
      ];

      const seeMoreButtonsSelectors = [
        '.pv-entity__description .lt-line-clamp__line.lt-line-clamp__line--last .lt-line-clamp__more[href="#"]',
        '.lt-line-clamp__more[href="#"]:not(.lt-line-clamp__ellipsis--dummy)',
      ];

      statusLog(
        logSection,
        'Expanding all sections by clicking their "See more" buttons',
        scraperSessionId
      );

      for (const buttonSelector of expandButtonsSelectors) {
        try {
          if ((await page.$(buttonSelector)) !== null) {
            statusLog(
              logSection,
              `Clicking button ${buttonSelector}`,
              scraperSessionId
            );
            await page.click(buttonSelector);
          }
        } catch (err) {
          statusLog(
            logSection,
            `Could not find or click expand button selector "${buttonSelector}". So we skip that one.`,
            scraperSessionId
          );
        }
      }

      // To give a little room to let data appear. Setting this to 0 might result in "Node is detached from document" errors
      await page.waitFor(100);

      statusLog(
        logSection,
        'Expanding all descriptions by clicking their "See more" buttons',
        scraperSessionId
      );

      for (const seeMoreButtonSelector of seeMoreButtonsSelectors) {
        const buttons = await page.$$(seeMoreButtonSelector);

        for (const button of buttons) {
          if (button) {
            try {
              statusLog(
                logSection,
                `Clicking button ${seeMoreButtonSelector}`,
                scraperSessionId
              );
              await button.click();
            } catch (err) {
              statusLog(
                logSection,
                `Could not find or click see more button selector "${button}". So we skip that one.`,
                scraperSessionId
              );
            }
          }
        }
      }

      statusLog(logSection, "Parsing profile data...", scraperSessionId);

      const rawUserProfileData: RawProfile = await page.evaluate(() => {
        const profileSection = document.querySelector(".pv-top-card");

        const url = window.location.href;

        const fullNameElement = profileSection?.querySelector(
          ".pv-top-card--list li:first-child"
        );
        const fullName = fullNameElement?.textContent || null;

        const titleElement = profileSection?.querySelector("h2");
        const title = titleElement?.textContent || null;

        const locationElement = profileSection?.querySelector(
          ".pv-top-card--list.pv-top-card--list-bullet.mt1 li:first-child"
        );
        const location = locationElement?.textContent || null;

        const photoElement =
          profileSection?.querySelector(".pv-top-card__photo") ||
          profileSection?.querySelector(".profile-photo-edit__preview");
        const photo = photoElement?.getAttribute("src") || null;

        const descriptionElement = document.querySelector(
          ".pv-about__summary-text .lt-line-clamp__raw-line"
        ); // Is outside "profileSection"
        const description = descriptionElement?.textContent || null;

        return {
          fullName,
          title,
          location,
          photo,
          description,
          url,
        } as RawProfile;
      });

      // Convert the raw data to clean data using our utils
      // So we don't have to inject our util methods inside the browser context, which is too damn difficult using TypeScript
      const userProfile: Profile = {
        ...rawUserProfileData,
        fullName: getCleanText(rawUserProfileData.fullName),
        title: getCleanText(rawUserProfileData.title),
        location: rawUserProfileData.location
          ? getLocationFromText(rawUserProfileData.location)
          : null,
        description: getCleanText(rawUserProfileData.description),
      };

      statusLog(
        logSection,
        `Got user profile data: ${JSON.stringify(userProfile)}`,
        scraperSessionId
      );

      statusLog(logSection, `Parsing experiences data...`, scraperSessionId);

      const rawExperiencesData: RawExperience[] = await page.$$eval(
        "#experience-section ul > .ember-view",
        (nodes) => {
          let data: RawExperience[] = [];

          // Using a for loop so we can use await inside of it
          for (const node of nodes) {
            const titleElement = node.querySelector("h3");
            const title = titleElement?.textContent || null;

            const employmentTypeElement = node.querySelector(
              "span.pv-entity__secondary-title"
            );
            const employmentType = employmentTypeElement?.textContent || null;

            const companyElement = node.querySelector(
              ".pv-entity__secondary-title"
            );
            const companyElementClean =
              companyElement && companyElement?.querySelector("span")
                ? companyElement?.removeChild(
                    companyElement.querySelector("span") as Node
                  ) && companyElement
                : companyElement || null;
            const company = companyElementClean?.textContent || null;

            const descriptionElement = node.querySelector(
              ".pv-entity__description"
            );
            const description = descriptionElement?.textContent || null;

            const dateRangeElement = node.querySelector(
              ".pv-entity__date-range span:nth-child(2)"
            );
            const dateRangeText = dateRangeElement?.textContent || null;

            const startDatePart = dateRangeText?.split("–")[0] || null;
            const startDate = startDatePart?.trim() || null;

            const endDatePart = dateRangeText?.split("–")[1] || null;
            const endDateIsPresent =
              endDatePart?.trim().toLowerCase() === "present" || false;
            const endDate =
              endDatePart && !endDateIsPresent ? endDatePart.trim() : "Present";

            const locationElement = node.querySelector(
              ".pv-entity__location span:nth-child(2)"
            );
            const location = locationElement?.textContent || null;

            data.push({
              title,
              company,
              employmentType,
              location,
              startDate,
              endDate,
              endDateIsPresent,
              description,
            });
          }

          return data;
        }
      );

      // Convert the raw data to clean data using our utils
      // So we don't have to inject our util methods inside the browser context, which is too damn difficult using TypeScript
      const experiences: Experience[] = rawExperiencesData.map(
        (rawExperience) => {
          const startDate = formatDate(rawExperience.startDate);
          const endDate = formatDate(rawExperience.endDate) || null;
          const endDateIsPresent = rawExperience.endDateIsPresent;

          const durationInDaysWithEndDate =
            startDate && endDate && !endDateIsPresent
              ? getDurationInDays(startDate, endDate)
              : null;
          const durationInDaysForPresentDate =
            endDateIsPresent && startDate
              ? getDurationInDays(startDate, new Date())
              : null;
          const durationInDays = endDateIsPresent
            ? durationInDaysForPresentDate
            : durationInDaysWithEndDate;

          return {
            ...rawExperience,
            title: getCleanText(rawExperience.title),
            company: getCleanText(rawExperience.company),
            employmentType: getCleanText(rawExperience.employmentType),
            location: rawExperience?.location
              ? getLocationFromText(rawExperience.location)
              : null,
            startDate,
            endDate,
            endDateIsPresent,
            durationInDays,
            description: getCleanText(rawExperience.description),
          };
        }
      );

      statusLog(
        logSection,
        `Got experiences data: ${JSON.stringify(experiences)}`,
        scraperSessionId
      );

      statusLog(logSection, `Parsing education data...`, scraperSessionId);

      const rawEducationData: RawEducation[] = await page.$$eval(
        "#education-section ul > .ember-view",
        (nodes) => {
          // Note: the $$eval context is the browser context.
          // So custom methods you define in this file are not available within this $$eval.
          let data: RawEducation[] = [];
          for (const node of nodes) {
            const schoolNameElement = node.querySelector(
              "h3.pv-entity__school-name"
            );
            const schoolName = schoolNameElement?.textContent || null;

            const degreeNameElement = node.querySelector(
              ".pv-entity__degree-name .pv-entity__comma-item"
            );
            const degreeName = degreeNameElement?.textContent || null;

            const fieldOfStudyElement = node.querySelector(
              ".pv-entity__fos .pv-entity__comma-item"
            );
            const fieldOfStudy = fieldOfStudyElement?.textContent || null;

            // const gradeElement = node.querySelector('.pv-entity__grade .pv-entity__comma-item');
            // const grade = (gradeElement && gradeElement.textContent) ? window.getCleanText(fieldOfStudyElement.textContent) : null;

            const dateRangeElement = node.querySelectorAll(
              ".pv-entity__dates time"
            );

            const startDatePart =
              (dateRangeElement && dateRangeElement[0]?.textContent) || null;
            const startDate = startDatePart || null;

            const endDatePart =
              (dateRangeElement && dateRangeElement[1]?.textContent) || null;
            const endDate = endDatePart || null;

            data.push({
              schoolName,
              degreeName,
              fieldOfStudy,
              startDate,
              endDate,
            });
          }

          return data;
        }
      );

      // Convert the raw data to clean data using our utils
      // So we don't have to inject our util methods inside the browser context, which is too damn difficult using TypeScript
      const education: Education[] = rawEducationData.map((rawEducation) => {
        const startDate = formatDate(rawEducation.startDate);
        const endDate = formatDate(rawEducation.endDate);

        return {
          ...rawEducation,
          schoolName: getCleanText(rawEducation.schoolName),
          degreeName: getCleanText(rawEducation.degreeName),
          fieldOfStudy: getCleanText(rawEducation.fieldOfStudy),
          startDate,
          endDate,
          durationInDays: getDurationInDays(startDate, endDate),
        };
      });

      statusLog(
        logSection,
        `Got education data: ${JSON.stringify(education)}`,
        scraperSessionId
      );

      statusLog(
        logSection,
        `Parsing volunteer experience data...`,
        scraperSessionId
      );

      const rawVolunteerExperiences: RawVolunteerExperience[] = await page.$$eval(
        ".pv-profile-section.volunteering-section ul > li.ember-view",
        (nodes) => {
          // Note: the $$eval context is the browser context.
          // So custom methods you define in this file are not available within this $$eval.
          let data: RawVolunteerExperience[] = [];
          for (const node of nodes) {
            const titleElement = node.querySelector(
              ".pv-entity__summary-info h3"
            );
            const title = titleElement?.textContent || null;

            const companyElement = node.querySelector(
              ".pv-entity__summary-info span.pv-entity__secondary-title"
            );
            const company = companyElement?.textContent || null;

            const dateRangeElement = node.querySelector(
              ".pv-entity__date-range span:nth-child(2)"
            );
            const dateRangeText = dateRangeElement?.textContent || null;
            const startDatePart = dateRangeText?.split("–")[0] || null;
            const startDate = startDatePart?.trim() || null;

            const endDatePart = dateRangeText?.split("–")[1] || null;
            const endDateIsPresent =
              endDatePart?.trim().toLowerCase() === "present" || false;
            const endDate =
              endDatePart && !endDateIsPresent ? endDatePart.trim() : "Present";

            const descriptionElement = node.querySelector(
              ".pv-entity__description"
            );
            const description = descriptionElement?.textContent || null;

            data.push({
              title,
              company,
              startDate,
              endDate,
              endDateIsPresent,
              description,
            });
          }

          return data;
        }
      );

      // Convert the raw data to clean data using our utils
      // So we don't have to inject our util methods inside the browser context, which is too damn difficult using TypeScript
      const volunteerExperiences: VolunteerExperience[] = rawVolunteerExperiences.map(
        (rawVolunteerExperience) => {
          const startDate = formatDate(rawVolunteerExperience.startDate);
          const endDate = formatDate(rawVolunteerExperience.endDate);

          return {
            ...rawVolunteerExperience,
            title: getCleanText(rawVolunteerExperience.title),
            company: getCleanText(rawVolunteerExperience.company),
            description: getCleanText(rawVolunteerExperience.description),
            startDate,
            endDate,
            durationInDays: getDurationInDays(startDate, endDate),
          };
        }
      );

      statusLog(
        logSection,
        `Got volunteer experience data: ${JSON.stringify(
          volunteerExperiences
        )}`,
        scraperSessionId
      );

      statusLog(logSection, `Parsing skills data...`, scraperSessionId);

      const skills: Skill[] = await page.$$eval(
        ".pv-skill-categories-section ol > .ember-view",
        (nodes) => {
          // Note: the $$eval context is the browser context.
          // So custom methods you define in this file are not available within this $$eval.

          return nodes.map((node) => {
            const skillName = node.querySelector(
              ".pv-skill-category-entity__name-text"
            );
            const endorsementCount = node.querySelector(
              ".pv-skill-category-entity__endorsement-count"
            );

            return {
              skillName: skillName ? skillName.textContent?.trim() : null,
              endorsementCount: endorsementCount
                ? parseInt(endorsementCount.textContent?.trim() || "0")
                : 0,
            } as Skill;
          }) as Skill[];
        }
      );

      statusLog(
        logSection,
        `Got skills data: ${JSON.stringify(skills)}`,
        scraperSessionId
      );

      statusLog(
        logSection,
        `Done! Returned profile details for: ${profileUrl}`,
        scraperSessionId
      );

      if (!this.scraper.options.keepAlive) {
        statusLog(logSection, "Not keeping the session alive.");

        await this.scraper.close(page);

        statusLog(logSection, "Done. Puppeteer is closed.");
      } else {
        statusLog(logSection, "Done. Puppeteer is being kept alive in memory.");

        // Only close the current page, we do not need it anymore
        await page.close();
      }

      return {
        userProfile,
        experiences,
        education,
        volunteerExperiences,
        skills,
      };
    } catch (err) {
      // Kill Puppeteer
      await this.scraper.close();

      statusLog(logSection, "An error occurred during a run.");

      // Throw the error up, allowing the user to handle this error himself.
      throw err;
    }
  };
}
