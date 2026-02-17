const { categorizeHolidayList } = require("./holiday-categorizer");

const MONTH_ORDER = [
    "januari", "februari", "maret", "april", "mei", "juni",
    "juli", "agustus", "september", "oktober", "november", "desember",
];

/**
 * Merge holidays from three sources.
 *
 * Priority order:
 *   1. kalenderku.id   — PRIMARY (Indonesian-specific, most accurate)
 *   2. timeanddate.com — SECONDARY (comprehensive international)
 *   3. tanggalan.com   — FALLBACK (last resort)
 *
 * For each date, only the highest-priority source that covers it is used.
 */
function mergeHolidays(tanggalanData, timeAndDateData, kalenderkuData = {}) {
    const allMonths = new Set();

    // Collect all month names from every source
    tanggalanData.forEach((month) => {
        allMonths.add(month.bulan.toLowerCase());
    });

    Object.keys(timeAndDateData).forEach((month) => {
        allMonths.add(month.toLowerCase());
    });

    Object.keys(kalenderkuData).forEach((month) => {
        allMonths.add(month.toLowerCase());
    });

    const sortedMonths = [...allMonths].sort(
        (a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b)
    );

    const result = [];

    sortedMonths.forEach((monthName) => {
        const tanggalanMonth = tanggalanData.find(
            (m) => m.bulan.toLowerCase() === monthName
        );
        const tanggalanDates = tanggalanMonth ? tanggalanMonth.data : [];
        const timeAndDateMonth = timeAndDateData[monthName] || {};
        const kalenderkuMonth = kalenderkuData[monthName] || {};

        const dates = [];

        // 1) kalenderku.id — PRIMARY source
        Object.keys(kalenderkuMonth).forEach((key) => {
            const tanggal = Number(key);
            if (Number.isNaN(tanggal)) return;

            const entry = kalenderkuMonth[tanggal];
            const holidayTypes = categorizeHolidayList(entry.holidays);

            dates.push({
                tanggal,
                hari: entry.day,
                Libur: entry.holidays,
                is_national_holiday: holidayTypes.some((type) => type !== "other"),
                holiday_type: holidayTypes,
                source: "kalenderku",
            });
        });

        // 2) timeanddate.com — SECONDARY (only dates kalenderku doesn't cover)
        Object.keys(timeAndDateMonth).forEach((key) => {
            const tanggal = Number(key);
            if (Number.isNaN(tanggal)) return;

            const alreadyExists = dates.some((d) => d.tanggal === tanggal);
            if (alreadyExists) return;

            const entry = timeAndDateMonth[tanggal];
            const holidayTypes = categorizeHolidayList(entry.holidays);

            dates.push({
                tanggal,
                hari: entry.day,
                Libur: entry.holidays,
                is_national_holiday: holidayTypes.some((type) => type !== "other"),
                holiday_type: holidayTypes,
                source: "timeanddate",
            });
        });

        // 3) tanggalan.com — FALLBACK (only dates neither above covers)
        tanggalanDates.forEach((item) => {
            const alreadyExists = dates.some((d) => d.tanggal === item.tanggal);
            if (alreadyExists) return;

            const holidayTypes = categorizeHolidayList(item.holidays);

            dates.push({
                tanggal: item.tanggal,
                hari: item.hari,
                Libur: item.holidays,
                is_national_holiday: holidayTypes.some((type) => type !== "other"),
                holiday_type: holidayTypes,
                source: "tanggalan",
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

module.exports = { mergeHolidays };
