const { categorizeHolidayList } = require("./holiday-categorizer");

const MONTH_ORDER = [
    "januari", "februari", "maret", "april", "mei", "juni",
    "juli", "agustus", "september", "oktober", "november", "desember",
];

/**
 * Merge holidays from both sources.
 *
 * Priority: timeanddate.com is the PRIMARY source (more accurate).
 * tanggalan.com is only used as FALLBACK for dates that timeanddate
 * does not cover.
 */
function mergeHolidays(tanggalanData, timeAndDateData) {
    const allMonths = new Set();

    tanggalanData.forEach((month) => {
        allMonths.add(month.bulan.toLowerCase());
    });

    Object.keys(timeAndDateData).forEach((month) => {
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

        const dates = [];

        // 1) Add all timeanddate dates first (PRIMARY source)
        Object.keys(timeAndDateMonth).forEach((key) => {
            const tanggal = Number(key);
            if (Number.isNaN(tanggal)) return;

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

        // 2) Add tanggalan dates ONLY if timeanddate doesn't have that date (FALLBACK)
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
