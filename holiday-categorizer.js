function categorizeHoliday(description) {
  const text = (description || "").toLowerCase();

  if (["idul fitri", "lebaran", "idul adha"].some((term) => text.includes(term))) {
    return "is_lebaran";
  }
  if (["isra", "muharram", "maulid"].some((term) => text.includes(term))) {
    return "is_holiday_muslim";
  }
  if (["kemerdekaan", "pancasila"].some((term) => text.includes(term))) {
    return "is_nationalism";
  }
  if (
    ["natal", "yesus kristus", "waisak", "buruh", "imlek", "tahun baru", "nyepi"].some((term) =>
      text.includes(term)
    )
  ) {
    return "is_holiday";
  }
  if (text.includes("cuti")) {
    return "is_cuti";
  }
  return "other";
}

function categorizeHolidayList(holidays) {
  const uniqueTypes = [];

  (holidays || []).forEach((name) => {
    const category = categorizeHoliday(name);
    if (!uniqueTypes.includes(category)) {
      uniqueTypes.push(category);
    }
  });

  return uniqueTypes;
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
