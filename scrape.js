const { parseTimeAndDate } = require("./timeanddate-parser");
const { parseCalendar } = require("./tanggalan-parser");

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

    return buildResponse(data, {
      year,
      tanggalanUrl,
      timeAndDateUrl,
    });
  });
}

module.exports = { scrape, parseCalendar, parseTimeAndDate };
