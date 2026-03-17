const cheerio = require("cheerio");

const DAY_NAMES = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

function getMonthName($, monthEl) {
  const title = $(monthEl).find(".kal-title .kal-title-link").first().text().trim().toLowerCase();
  return title.replace(/\s+\d{4}$/, "").trim();
}

function expandDayToken(dayToken) {
  if (!dayToken) return [];

  return dayToken
    .split(",")
    .flatMap((part) => {
      const value = part.trim();
      if (!value) return [];

      const rangeMatch = value.match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
      if (rangeMatch) {
        const start = Number(rangeMatch[1]);
        const end = Number(rangeMatch[2]);
        if (Number.isNaN(start) || Number.isNaN(end) || end < start) return [];

        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
      }

      const single = Number(value);
      return Number.isNaN(single) ? [] : [single];
    });
}

function getLocalHolidays($, monthEl) {
  const holidays = {};

  $(monthEl)
    .find(".kal-libur-list > li")
    .each((_, item) => {
      const dayToken = $(item).find(".kal-libur-day").first().text().trim();
      const name = $(item)
        .clone()
        .find(".kal-libur-day")
        .remove()
        .end()
        .text()
        .replace(/\s+/g, " ")
        .trim();

      if (!dayToken || !name || name === "Bulan Tanpa Libur Nasional") {
        return;
      }

      expandDayToken(dayToken).forEach((tanggal) => {
        if (!holidays[tanggal]) holidays[tanggal] = [];

        if (!holidays[tanggal].includes(name)) {
          holidays[tanggal].push(name);
        }
      });
    });

  return holidays;
}

function parseCalendar(html) {
  const $ = cheerio.load(html);
  const result = [];

  $(".entry-content .kalender-indo").each((_, monthEl) => {
    const monthName = getMonthName($, monthEl);
    if (!monthName) return;

    const localHolidays = getLocalHolidays($, monthEl);
    const dates = [];
    let slotIndex = 0;

    $(monthEl)
      .find(".kal-grid-body")
      .first()
      .children("s, a")
      .each((__, node) => {
        const tag = node.tagName.toLowerCase();

        if (tag === "s") {
          slotIndex += 1;
          return;
        }

        const tanggal = Number($(node).find("div").first().text().trim());
        if (!Number.isNaN(tanggal)) {
          const classNames = ($(node).attr("class") || "").split(/\s+/).filter(Boolean);
          const holidayNames = localHolidays[tanggal] || [];
          const hari =
            (classNames.includes("sun") ? "minggu" : null) ||
            (classNames.includes("sat") ? "sabtu" : null) ||
            DAY_NAMES[slotIndex % 7];

          if (holidayNames.length > 0) {
            dates.push({
              tanggal,
              hari,
              holidays: holidayNames,
            });
          }
        }

        slotIndex += 1;
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
