function categorizeHoliday(description) {
  const text = (description || "").toLowerCase();
  const categories = new Set();

  if (text.includes("cuti")) {
    categories.add("is_cuti");
  }

  if (["idul fitri", "lebaran", "idul adha", "idulfitri", "iduladha"].some((term) => text.includes(term))) {
    categories.add("is_lebaran");
  }

  if (["isra", "muharram", "maulid", "hijriah"].some((term) => text.includes(term))) {
    categories.add("is_holiday_muslim");
  }

  if (["kemerdekaan", "pancasila"].some((term) => text.includes(term))) {
    categories.add("is_nationalism");
  }

  if (
    ["natal", "yesus kristus", "waisak", "buruh", "imlek", "tahun baru", "nyepi", "jumat agung", "paskah"].some((term) =>
      text.includes(term)
    )
  ) {
    categories.add("is_holiday");
  }

  if (categories.size === 0) {
    return ["other"];
  }

  return Array.from(categories);
}

function categorizeHolidayList(holidays) {
  const uniqueTypes = new Set();

  (holidays || []).forEach((name) => {
    const cats = categorizeHoliday(name);
    cats.forEach((c) => uniqueTypes.add(c));
  });

  return Array.from(uniqueTypes);
}

const HOLIDAY_CATEGORIES = [
  "is_lebaran",
  "is_holiday_muslim",
  "is_nationalism",
  "is_holiday",
  "is_cuti",
  "other",
];

module.exports = { categorizeHoliday, categorizeHolidayList, HOLIDAY_CATEGORIES };
