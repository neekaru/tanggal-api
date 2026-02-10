const HOLIDAY_NAME_MAP_ID = {
  "New Year's Day": "Tahun Baru Masehi",
  "Ascension of the Prophet Muhammad": "Isra Mikraj Nabi Muhammad",
  "Chinese New Year Joint Holiday": "Cuti Bersama Tahun Baru Imlek",
  "Chinese New Year's Day": "Tahun Baru Imlek",
  "Ramadan Start (Tentative Date)": "Awal Ramadan (Perkiraan)",
  "Joint Holiday for Bali's Day of Silence and Hindu New Year (Nyepi)":
    "Cuti Bersama Nyepi",
  "Bali's Day of Silence and Hindu New Year (Nyepi)": "Hari Suci Nyepi",
  "Idul Fitri Joint Holiday": "Cuti Bersama Idul Fitri",
  "Idul Fitri (Tentative Date)": "Idul Fitri (Perkiraan)",
  "Idul Fitri Holiday (Tentative Date)": "Libur Idul Fitri (Perkiraan)",
  "Good Friday": "Wafat Yesus Kristus",
  "Easter Sunday": "Hari Paskah",
  "International Labor Day": "Hari Buruh Internasional",
  "Ascension Day of Jesus Christ": "Kenaikan Yesus Kristus",
  "Joint Holiday after Ascension Day": "Cuti Bersama Kenaikan Yesus Kristus",
  "Idul Adha (Tentative Date)": "Idul Adha (Perkiraan)",
  "Joint Holiday for Idul Adha": "Cuti Bersama Idul Adha",
  "Waisak Day (Buddha's Anniversary) (Tentative Date)": "Hari Raya Waisak (Perkiraan)",
  "Pancasila Day": "Hari Lahir Pancasila",
  "Muharram / Islamic New Year (Tentative Date)": "Tahun Baru Islam 1 Muharam (Perkiraan)",
  "Indonesian Independence Day": "Hari Kemerdekaan Republik Indonesia",
  "Maulid Nabi Muhammad (Tentative Date)": "Maulid Nabi Muhammad (Perkiraan)",
  "Christmas Eve Joint Holiday": "Cuti Bersama Malam Natal",
  "Christmas Day": "Hari Natal",
  "New Year's Eve": "Malam Tahun Baru",
};

function mapHolidayName(name) {
  return HOLIDAY_NAME_MAP_ID[name] || name;
}

module.exports = { mapHolidayName };
