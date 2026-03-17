const { parseTimeAndDate } = require("./timeanddate-parser");
const { parseCalendar } = require("./tanggalan-parser");
const { parseKalenderku } = require("./kalenderku-parser");
const { mergeHolidays } = require("./holiday-merger");

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
const scrapeCache = new Map();

const FETCH_HEADERS = {
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "max-age=0",
  priority: "u=0, i",
  referer: "https://www.google.com/",
  "sec-ch-ua": '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "same-origin",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
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

async function fetchHtml(label, url) {
  console.log(`[scrape] Fetching ${label}: ${url}`);

  try {
    const response = await fetch(url, { headers: FETCH_HEADERS });

    if (!response.ok) {
      throw new Error(`${label} failed with status ${response.status}`);
    }

    console.log(`[scrape] ${label} responded with ${response.status}`);
    return await response.text();
  } catch (error) {
    const details = error.cause && error.cause.message
      ? `${error.message} (${error.cause.message})`
      : error.message;

    console.error(`[scrape] ${label} fetch error: ${details}`);
    throw new Error(`${label} fetch failed: ${details}`);
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

  return Promise.all([
    fetchHtml("Kalenderku", kalenderkuUrl),
    fetchHtml("Timeanddate", timeAndDateUrl),
    fetchHtml("Tanggalan", tanggalanUrl),
  ]).then(([kalenderkuHtml, timeAndDateHtml, tanggalanHtml]) => {
    console.log("[scrape] Parsing Kalenderku source");
    const kalenderkuData = parseKalenderku(kalenderkuHtml);
    console.log(`[scrape] Parsed ${Object.keys(kalenderkuData).length} holiday months from kalenderku`);

    console.log("[scrape] Parsing Timeanddate source");
    const timeAndDateData = parseTimeAndDate(timeAndDateHtml);
    console.log(
      `[scrape] Parsed ${Object.keys(timeAndDateData).length} holiday months from timeanddate`
    );

    console.log("[scrape] Parsing Tanggalan source");
    const tanggalanData = parseCalendar(tanggalanHtml);
    console.log(`[scrape] Parsed ${tanggalanData.length} holiday months from tanggalan`);

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
