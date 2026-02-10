const { parseTimeAndDate } = require("./timeanddate-parser");
const { parseCalendar } = require("./tanggalan-parser");

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
const scrapeCache = new Map();

function cloneResult(value) {
  return JSON.parse(JSON.stringify(value));
}

function getCacheKey({ year, url }) {
  return `${year}::${url || "https://www.tanggalan.com/"}`;
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
      tanggalan: metadata.tanggalanUrl,
      timeanddate: metadata.timeAndDateUrl,
    },
    totalMonths: data.length,
    data,
  };
}

function scrape(options = {}) {
  const year = Number.isInteger(options.year) ? options.year : new Date().getFullYear();
  const tanggalanUrl = options.url || "https://www.tanggalan.com/";
  const timeAndDateUrl = `https://www.timeanddate.com/holidays/indonesia/${year}`;
  const cacheKey = getCacheKey({ year, url: tanggalanUrl });
  const cached = getCachedResult(cacheKey);

  if (cached) {
    return Promise.resolve(cached);
  }

  return Promise.all([
    fetch(tanggalanUrl).then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.text();
    }),
    fetch(timeAndDateUrl).then((response) => {
      if (!response.ok) {
        throw new Error(`Timeanddate failed with status ${response.status}`);
      }
      return response.text();
    }),
  ]).then(([tanggalanHtml, timeAndDateHtml]) => {
    const timeAndDateMap = parseTimeAndDate(timeAndDateHtml);
    const data = parseCalendar(tanggalanHtml, timeAndDateMap);

    const result = buildResponse(data, {
      year,
      tanggalanUrl,
      timeAndDateUrl,
    });

    setCachedResult(cacheKey, result);
    return result;
  });
}

module.exports = { scrape, parseCalendar, parseTimeAndDate, CACHE_TTL_MS, CACHE_TTL_SECONDS };
