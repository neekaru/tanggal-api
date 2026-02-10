const { scrape, CACHE_TTL_SECONDS } = require("../scrape");
const { HOLIDAY_CATEGORIES } = require("../holiday-categorizer");

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

function getYear(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return new Date().getFullYear();
  if (parsed < MIN_YEAR || parsed > MAX_YEAR) return new Date().getFullYear();
  return parsed;
}

function parseHolidayTypeFilter(value) {
  if (!value) return [];

  const rawList = Array.isArray(value) ? value : [value];
  const normalized = [];

  rawList.forEach((entry) => {
    String(entry)
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .forEach((item) => {
        if (!normalized.includes(item)) {
          normalized.push(item);
        }
      });
  });

  return normalized;
}

function filterByHolidayType(data, selectedTypes) {
  if (selectedTypes.length === 0) return data;

  return data
    .map((monthItem) => ({
      ...monthItem,
      data: monthItem.data.filter((dateItem) =>
        (dateItem.holiday_type || []).some((type) => selectedTypes.includes(type))
      ),
    }))
    .filter((monthItem) => monthItem.data.length > 0);
}

function parseNationalHolidayFilter(value) {
  if (value === undefined || value === null || value === "") {
    return { value: null, error: null };
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return { value: true, error: null };
  }
  if (normalized === "false" || normalized === "0") {
    return { value: false, error: null };
  }

  return {
    value: null,
    error: "Invalid is_national_holiday. Use true/false or 1/0.",
  };
}

function filterByNationalHoliday(data, selectedNationalHoliday) {
  if (selectedNationalHoliday === null) return data;

  return data
    .map((monthItem) => ({
      ...monthItem,
      data: monthItem.data.filter(
        (dateItem) => Boolean(dateItem.is_national_holiday) === selectedNationalHoliday
      ),
    }))
    .filter((monthItem) => monthItem.data.length > 0);
}

module.exports = async function handler(req, res) {
  try {
    const year = getYear(req.query.year);
    const holidayTypes = parseHolidayTypeFilter(req.query.holiday_type);
    const nationalHolidayFilter = parseNationalHolidayFilter(req.query.is_national_holiday);

    if (nationalHolidayFilter.error) {
      return res.status(400).json({
        success: false,
        message: nationalHolidayFilter.error,
      });
    }

    const invalidTypes = holidayTypes.filter((type) => !HOLIDAY_CATEGORIES.includes(type));
    if (invalidTypes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid holiday_type: ${invalidTypes.join(", ")}`,
        allowedHolidayTypes: HOLIDAY_CATEGORIES,
      });
    }

    const result = await scrape({ year });
    const filteredByType = filterByHolidayType(result.data, holidayTypes);
    const filteredData = filterByNationalHoliday(filteredByType, nationalHolidayFilter.value);
    const appliedFilters = {
      holiday_type: holidayTypes,
      is_national_holiday: nationalHolidayFilter.value,
    };

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", `public, max-age=0, s-maxage=${CACHE_TTL_SECONDS}`);
    return res.status(200).json({
      ...result,
      appliedFilters,
      cacheTtlSeconds: CACHE_TTL_SECONDS,
      totalMonths: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
