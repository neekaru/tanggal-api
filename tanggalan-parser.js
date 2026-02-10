const cheerio = require("cheerio");

const DAY_NAMES = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

function getMonthName($, monthEl) {
  return $(monthEl)
    .find("li")
    .eq(0)
    .find("a")
    .clone()
    .find("b")
    .remove()
    .end()
    .text()
    .trim();
}

function getLocalHolidays($, monthEl) {
  const holidays = {};

  $(monthEl)
    .find("li")
    .eq(3)
    .find("tr")
    .each((_, tr) => {
      const tanggal = Number($(tr).find("td").eq(0).text().trim());
      const nama = $(tr).find("td").eq(1).text().trim();
      if (!Number.isNaN(tanggal) && nama) {
        if (!holidays[tanggal]) holidays[tanggal] = [];
        holidays[tanggal].push(nama);
      }
    });

  return holidays;
}

function parseCalendar(html, timeAndDateMap = {}) {
  const $ = cheerio.load(html);
  const result = [];

  $("article ul").each((_, monthEl) => {
    const monthName = getMonthName($, monthEl);
    const localHolidays = getLocalHolidays($, monthEl);
    const dates = [];
    let index = 0;

    $(monthEl)
      .find("li")
      .eq(2)
      .children("s, a")
      .each((__, node) => {
        const tag = node.tagName.toLowerCase();
        if (tag === "s") {
          index += 1;
          return;
        }

        const tanggal = Number($(node).text().trim());
        if (!Number.isNaN(tanggal)) {
          const localHolidayNames = localHolidays[tanggal] || [];
          const externalHolidayNames =
            (timeAndDateMap[monthName] && timeAndDateMap[monthName][tanggal]
              ? timeAndDateMap[monthName][tanggal].holidays
              : []) || [];
          const selectedHolidayNames =
            localHolidayNames.length > 0 ? localHolidayNames : externalHolidayNames;

          if (selectedHolidayNames.length > 0) {
            dates.push({
              tanggal,
              hari: DAY_NAMES[index % 7],
              Libur: selectedHolidayNames,
            });
          }
        }
        index += 1;
      });

    Object.keys(timeAndDateMap[monthName] || {}).forEach((key) => {
      const tanggal = Number(key);
      if (Number.isNaN(tanggal)) return;
      const exists = dates.some((item) => item.tanggal === tanggal);
      if (exists) return;

      const external = timeAndDateMap[monthName][tanggal];
      dates.push({
        tanggal,
        hari: external.day,
        Libur: external.holidays,
      });
    });

    dates.sort((a, b) => a.tanggal - b.tanggal);

    if (dates.length > 0) {
      result.push({
        bulan: monthName.toUpperCase(),
        data: dates,
      });
    }
  });

  return result;
}

module.exports = { parseCalendar };
