const { parseTimeAndDate } = require("./timeanddate-parser");
const { parseCalendar } = require("./tanggalan-parser");
const { parseKalenderku } = require("./kalenderku-parser");
const { mergeHolidays } = require("./holiday-merger");

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
const scrapeCache = new Map();

const FETCH_HEADERS = {
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "max-age=0",
  "priority": "u=0, i",
  "referer": "https://www.google.com/",
  "sec-ch-ua": '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "same-origin",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
};

function cloneResult(value) {
  return JSON.parse(JSON.stringify(value));
}

function getCacheKey({ year }) {
  return `${year}`;
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

function fetchPage(url) {
  return fetch(url, { headers: FETCH_HEADERS }).then((response) => {
    if (!response.ok) {
      throw new Error(`${url} failed with status ${response.status}`);
    }
    return response.text();
  });
}

function scrape(options = {}) {
  const year = Number.isInteger(options.year) ? options.year : new Date().getFullYear();
  const kalenderkuUrl = `https://kalenderku.id/${year}`;
  const timeAndDateUrl = `https://www.timeanddate.com/holidays/indonesia/${year}`;
  const tanggalanUrl = `https://tanggalan.com/${year}`;

  const cacheKey = getCacheKey({ year });
  const cached = getCachedResult(cacheKey);

  if (cached) {
    return Promise.resolve(cached);
  }

  return Promise.all([
    fetchPage(kalenderkuUrl),
    fetchPage(timeAndDateUrl),
    fetchPage(tanggalanUrl),
  ]).then(([kalenderkuHtml, timeAndDateHtml, tanggalanHtml]) => {
    // Each parser only parses its own source
    const kalenderkuData = parseKalenderku(kalenderkuHtml);
    const timeAndDateData = parseTimeAndDate(timeAndDateHtml);
    const tanggalanData = parseCalendar(tanggalanHtml);

    // Merge: kalenderku > timeanddate > tanggalan
    const data = mergeHolidays(tanggalanData, timeAndDateData, kalenderkuData);

    const result = buildResponse(data, {
      year,
      kalenderkuUrl,
      timeAndDateUrl,
      tanggalanUrl,
    });

    setCachedResult(cacheKey, result);
    return result;
  });
}

module.exports = { scrape, parseCalendar, parseTimeAndDate, parseKalenderku, mergeHolidays, CACHE_TTL_MS, CACHE_TTL_SECONDS };
