function categorizeHoliday(description) {
  const text = (description || "").toLowerCase();

  // Priority 1: Cuti Bersama
  if (text.includes("cuti")) {
    return "is_cuti";
  }

  // Priority 2: Major Muslim Holidays (Lebaran)
  if (["idul fitri", "lebaran", "idul adha", "idulfitri", "iduladha"].some((term) => text.includes(term))) {
    return "is_lebaran";
  }

  // Priority 3: Other Muslim Holidays
  if (["isra", "muharram", "maulid", "hijriah"].some((term) => text.includes(term))) {
    return "is_holiday_muslim";
  }

  // Priority 4: Nationalism
  if (["kemerdekaan", "pancasila"].some((term) => text.includes(term))) {
    return "is_nationalism";
  }

  // Priority 5: General Holidays
  if (
    ["natal", "yesus kristus", "waisak", "buruh", "imlek", "tahun baru", "nyepi", "jumat agung", "paskah"].some((term) =>
      text.includes(term)
    )
  ) {
    return "is_holiday";
  }

  return "other";
}

function categorizeHolidayList(holidays) {
  const uniqueTypes = new Set();

  (holidays || []).forEach((name) => {
    const category = categorizeHoliday(name);
    uniqueTypes.add(category);
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
