const { scrape } = require("../scrape");

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

function getYear(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return new Date().getFullYear();
  if (parsed < MIN_YEAR || parsed > MAX_YEAR) return new Date().getFullYear();
  return parsed;
}

module.exports = async function handler(req, res) {
  try {
    const year = getYear(req.query.year);
    const result = await scrape({ year });

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
