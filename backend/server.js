const http = require("http");
const app = require("./app");
const db = require("./db");
const logger = require("log4js").getLogger();
logger.level = "debug";

// http - debug only
const server = http.createServer(app);
const hostname = "0.0.0.0";
const port = 3001;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
const gracefulShutdown = () =>
  server.close((err) => {
    logger.debug("server closed");
    if (err) {
      logger.debug(err.details || err);
    }
    db.close();
    process.exit(err ? 1 : 0);
  });

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
