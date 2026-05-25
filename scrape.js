const { fetch } = require("wreq-js");
const { parseTimeAndDate } = require("./timeanddate-parser");
const { parseCalendar } = require("./tanggalan-parser");
const { parseKalenderku } = require("./kalenderku-parser");
const { mergeHolidays } = require("./holiday-merger");

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
const scrapeCache = new Map();

const WREQ_OPTIONS = {
  browser: "chrome_144",
  os: "windows",
  headers: {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    referer: "https://www.google.com/",
  },
};

function cloneResult(value) {
  return JSON.parse(JSON.stringify(value));
}

function getCacheKey({ year, url }) {
  return `${year}::${url || `https://tanggalans.com/kalender-${year}/`}`;
}

function getCachedResult(cacheKey) {
  const entry = scrapeCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    scrapeCache.delete(cacheKey);
    return null;
  }
  return cloneResult(entry.value);
}

function setCachedResult(cacheKey, value) {
  scrapeCache.set(cacheKey, {
    value: cloneResult(value),
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function buildResponse(data, metadata) {
  return {
    success: true,
    generatedAt: new Date().toISOString(),
    year: metadata.year,
    source: {
      kalenderku: metadata.kalenderkuUrl,
      timeanddate: metadata.timeAndDateUrl,
      tanggalan: metadata.tanggalanUrl,
    },
    totalMonths: data.length,
    data,
  };
}

async function fetchHtml(label, url, retries = 3, delay = 2000) {
  console.log(`[scrape] Fetching ${label}: ${url}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, WREQ_OPTIONS);

      if (!response.ok) {
        if (response.status === 403 && attempt < retries) {
          console.log(`[scrape] ${label} returned 403, retrying in ${delay}ms (attempt ${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`${label} failed with status ${response.status}`);
      }

      console.log(`[scrape] ${label} responded with ${response.status}`);
      return await response.text();
    } catch (error) {
      if (attempt === retries) {
        const details = error.cause && error.cause.message
          ? `${error.message} (${error.cause.message})`
          : error.message;

        console.error(`[scrape] ${label} fetch error: ${details}`);
        throw new Error(`${label} fetch failed: ${details}`);
      }
      console.log(`[scrape] ${label} error, retrying in ${delay}ms (attempt ${attempt}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function scrape(options = {}) {
  const year = Number.isInteger(options.year) ? options.year : new Date().getFullYear();
  const kalenderkuUrl = `https://kalenderku.id/${year}`;
  const timeAndDateUrl = `https://www.timeanddate.com/holidays/indonesia/${year}`;
  const tanggalanUrl = options.url || `https://tanggalans.com/kalender-${year}/`;

  const cacheKey = getCacheKey({ year, url: tanggalanUrl });
  const cached = getCachedResult(cacheKey);

  console.log(`[scrape] Start for year ${year}`);
  console.log(`[scrape] Kalenderku URL: ${kalenderkuUrl}`);
  console.log(`[scrape] Tanggalan URL: ${tanggalanUrl}`);
  console.log(`[scrape] Timeanddate URL: ${timeAndDateUrl}`);

  if (cached) {
    console.log("[scrape] Returning cached result");
    return Promise.resolve(cached);
  }

  console.log("[scrape] Fetching source pages");

  return Promise.allSettled([
    fetchHtml("Kalenderku", kalenderkuUrl),
    fetchHtml("Timeanddate", timeAndDateUrl),
    fetchHtml("Tanggalan", tanggalanUrl),
  ]).then(([kalenderkuResult, timeAndDateResult, tanggalanResult]) => {
    let kalenderkuData = {};
    let timeAndDateData = {};
    let tanggalanData = [];

    if (kalenderkuResult.status === "fulfilled") {
      console.log("[scrape] Parsing Kalenderku source");
      kalenderkuData = parseKalenderku(kalenderkuResult.value);
      console.log(`[scrape] Parsed ${Object.keys(kalenderkuData).length} holiday months from kalenderku`);
    } else {
      console.warn("[scrape] Kalenderku fetch failed, continuing without it");
    }

    if (timeAndDateResult.status === "fulfilled") {
      console.log("[scrape] Parsing Timeanddate source");
      timeAndDateData = parseTimeAndDate(timeAndDateResult.value);
      console.log(
        `[scrape] Parsed ${Object.keys(timeAndDateData).length} holiday months from timeanddate`
      );
    } else {
      console.warn("[scrape] Timeanddate fetch failed, continuing without it");
    }

    if (tanggalanResult.status === "fulfilled") {
      console.log("[scrape] Parsing Tanggalan source");
      tanggalanData = parseCalendar(tanggalanResult.value);
      console.log(`[scrape] Parsed ${tanggalanData.length} holiday months from tanggalan`);
    } else {
      console.error("[scrape] Tanggalan fetch failed - this is required");
      throw new Error("Tanggalan fetch failed and it is required for scraping");
    }

    console.log("[scrape] Merging holiday sources");
    const data = mergeHolidays(tanggalanData, timeAndDateData, kalenderkuData);
    console.log(`[scrape] Merged ${data.length} months`);

    const result = buildResponse(data, {
      year,
      kalenderkuUrl,
      timeAndDateUrl,
      tanggalanUrl,
    });

    setCachedResult(cacheKey, result);
    console.log("[scrape] Done");
    return result;
  });
}

module.exports = { scrape, parseCalendar, parseTimeAndDate, parseKalenderku, mergeHolidays, CACHE_TTL_MS, CACHE_TTL_SECONDS };
