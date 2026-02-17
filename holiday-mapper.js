// Mapping English holiday names from timeanddate.com to Indonesian
// Ordered by calendar appearance (Jan → Dec)
const HOLIDAY_NAME_MAP_ID = {
  // Januari
  "New Year's Day": "Tahun Baru Masehi",
  "Ascension of the Prophet Muhammad": "Isra Mikraj Nabi Muhammad",

  // Februari
  "Chinese New Year Joint Holiday": "Cuti Bersama Tahun Baru Imlek",
  "Chinese New Year's Day": "Tahun Baru Imlek",
  "Chinese New Year (Tentative Date)": "Tahun Baru Imlek (Perkiraan)",
  "Joint Holiday for Chinese New Year": "Cuti Bersama Tahun Baru Imlek",
  "Ramadan Start (Tentative Date)": "Awal Ramadan (Perkiraan)",

  // Maret
  "Joint Holiday for Bali's Day of Silence and Hindu New Year (Nyepi)":
    "Cuti Bersama Nyepi",
  "Bali's Day of Silence and Hindu New Year (Nyepi)": "Hari Suci Nyepi",
  "Idul Fitri Joint Holiday": "Cuti Bersama Idul Fitri",
  "Idul Fitri (Tentative Date)": "Idul Fitri (Perkiraan)",
  "Idul Fitri Holiday (Tentative Date)": "Libur Idul Fitri (Perkiraan)",
  "Joint Holiday for Idul Fitri (Tentative Date)": "Cuti Bersama Idul Fitri (Perkiraan)",

  // April
  "Good Friday": "Wafat Yesus Kristus",
  "Easter Sunday": "Hari Paskah",

  // Mei
  "International Labor Day": "Hari Buruh Internasional",
  "Ascension Day of Jesus Christ": "Kenaikan Yesus Kristus",
  "Joint Holiday after Ascension Day": "Cuti Bersama Kenaikan Yesus Kristus",
  "Idul Adha (Tentative Date)": "Idul Adha (Perkiraan)",
  "Joint Holiday for Idul Adha": "Cuti Bersama Idul Adha",
  "Joint Holiday for Idul Adha (Tentative Date)": "Cuti Bersama Idul Adha (Perkiraan)",
  "Waisak Day (Buddha's Anniversary) (Tentative Date)": "Hari Raya Waisak (Perkiraan)",
  "Joint Holiday for Waisak Day (Tentative Date)": "Cuti Bersama Waisak (Perkiraan)",

  // Juni
  "Pancasila Day": "Hari Lahir Pancasila",
  "Muharram / Islamic New Year (Tentative Date)": "Tahun Baru Islam 1 Muharam (Perkiraan)",
  "Joint Holiday for Muharram (Tentative Date)": "Cuti Bersama Tahun Baru Islam (Perkiraan)",

  // Agustus
  "Indonesian Independence Day": "Hari Kemerdekaan Republik Indonesia",
  "Maulid Nabi Muhammad (Tentative Date)": "Maulid Nabi Muhammad (Perkiraan)",
  "Joint Holiday for Maulid Nabi (Tentative Date)": "Cuti Bersama Maulid Nabi (Perkiraan)",

  // Desember
  "Christmas Eve Joint Holiday": "Cuti Bersama Malam Natal",
  "Christmas Day": "Hari Natal",
  "New Year's Eve": "Malam Tahun Baru",
};

function mapHolidayName(name) {
  return HOLIDAY_NAME_MAP_ID[name] || name;
}

module.exports = { mapHolidayName };
