const cheerio = require("cheerio");

const MONTH_MAP = {
    januari: "januari",
    februari: "februari",
    maret: "maret",
    april: "april",
    mei: "mei",
    juni: "juni",
    juli: "juli",
    agustus: "agustus",
    september: "september",
    oktober: "oktober",
    november: "november",
    desember: "desember",
};

/**
 * Parse kalenderku.id HTML and extract holiday data.
 *
 * Returns a map: { [monthName]: { [date]: { day, holidays, types } } }
 * Compatible with the timeanddate parser output format.
 */
function parseKalenderku(html) {
    const $ = cheerio.load(html);
    const byMonthDate = {};

    // kalenderku.id renders a table with columns: Tanggal, Hari, Nama, Jenis
    $("table").each((_, table) => {
        const headers = $(table)
            .find("thead tr th")
            .map((_, th) => $(th).text().trim())
            .get();

        // Only process the holiday table (has "Nama" and "Jenis" columns)
        if (!headers.includes("Nama") || !headers.includes("Jenis")) return;

        $(table)
            .find("tbody tr")
            .each((_, row) => {
                const cols = $(row).find("td");
                if (cols.length < 4) return;

                const dateStr = $(cols[0]).text().trim(); // e.g. "1 Januari"
                const dayStr = $(cols[1]).text().trim();  // e.g. "Kamis"
                const name = $(cols[2]).text().trim();    // e.g. "Tahun Baru 2026 Masehi"
                const type = $(cols[3]).text().trim();    // e.g. "Libur" or "Cuti"

                // Parse "1 Januari" → tanggal=1, month="januari"
                const parts = dateStr.split(/\s+/);
                if (parts.length < 2) return;

                const tanggal = parseInt(parts[0], 10);
                const monthRaw = parts[1].toLowerCase();
                const month = MONTH_MAP[monthRaw];

                if (!month || Number.isNaN(tanggal)) return;

                if (!byMonthDate[month]) {
                    byMonthDate[month] = {};
                }

                if (!byMonthDate[month][tanggal]) {
                    byMonthDate[month][tanggal] = {
                        day: dayStr.toLowerCase(),
                        holidays: [],
                        types: [],
                    };
                }

                // Avoid duplicate holiday names on the same date
                if (!byMonthDate[month][tanggal].holidays.includes(name)) {
                    byMonthDate[month][tanggal].holidays.push(name);
                    byMonthDate[month][tanggal].types.push(type);
                }
            });
    });

    return byMonthDate;
}

module.exports = { parseKalenderku };
