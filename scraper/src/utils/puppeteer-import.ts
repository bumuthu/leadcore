type page = any;
type browser = any;

try {
    require("puppeteer-core");
    console.log("found puppeteer package")
} catch (err) {
    console.log("puppeteer package not available");
}

export type Page = page;
export type Browser = browser;


