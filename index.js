const { scrape } = require("./scrape");

console.log("[index] Running scrape()");
scrape()
  .then((result) => {
    console.log("[index] Scrape succeeded");
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error("[index] Scrape failed:", error.message);
    if (error.cause && error.cause.message) {
      console.error("[index] Root cause:", error.cause.message);
    }
    if (error.stack) {
      console.error(error.stack);
    }
  });
