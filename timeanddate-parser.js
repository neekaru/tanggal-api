const cheerio = require("cheerio");
const { mapHolidayName } = require("./holiday-mapper");

const INDONESIAN_DAY_FROM_ENGLISH = {
  sunday: "minggu",
  monday: "senin",
  tuesday: "selasa",
  wednesday: "rabu",
  thursday: "kamis",
  friday: "jumat",
  saturday: "sabtu",
};

const MONTH_FROM_ABBR = {
  jan: "januari",
  feb: "februari",
  mar: "maret",
  apr: "april",
  mei: "mei",
  may: "mei",
  jun: "juni",
  jul: "juli",
  agu: "agustus",
  aug: "agustus",
  sep: "september",
  okt: "oktober",
  oct: "oktober",
  nov: "november",
  des: "desember",
  dec: "desember",
};

const ALLOWED_TYPES = new Set(["Public Holiday", "Joint Holiday", "National Holiday", "Observance"]);

function parseTimeAndDate(html) {
  const $ = cheerio.load(html);
  const byMonthDate = {};

  $("#holidays-table tbody tr").each((_, row) => {
    const id = $(row).attr("id") || "";
    if (!id.startsWith("tr")) return;

    const dateText = $(row).find("th").eq(0).text().trim();
    const dayText = $(row).find("td").eq(0).text().trim();
    const name = $(row).find("td").eq(1).text().trim();
    const type = $(row).find("td").eq(2).text().trim();
    if (!ALLOWED_TYPES.has(type)) return;

    const match = dateText.match(/^(\d{1,2})\s+([A-Za-z]{3})$/);
    if (!match || !name) return;

    const tanggal = Number(match[1]);
    const month = MONTH_FROM_ABBR[match[2].toLowerCase()];
    if (!month || Number.isNaN(tanggal)) return;

    if (!byMonthDate[month]) byMonthDate[month] = {};
    if (!byMonthDate[month][tanggal]) {
      byMonthDate[month][tanggal] = {
        day: INDONESIAN_DAY_FROM_ENGLISH[dayText.toLowerCase()] || dayText.toLowerCase(),
        holidays: [],
      };
    }

    byMonthDate[month][tanggal].holidays.push(mapHolidayName(name));
  });

  return byMonthDate;
}

module.exports = { parseTimeAndDate };
