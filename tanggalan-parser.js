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

function parseCalendar(html) {
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
          const holidayNames = localHolidays[tanggal] || [];

          if (holidayNames.length > 0) {
            dates.push({
              tanggal,
              hari: DAY_NAMES[index % 7],
              holidays: holidayNames,
            });
          }
        }
        index += 1;
      });

    dates.sort((a, b) => a.tanggal - b.tanggal);

    if (dates.length > 0) {
      result.push({
        bulan: monthName.toLowerCase(),
        data: dates,
      });
    }
  });

  return result;
}

module.exports = { parseCalendar };
