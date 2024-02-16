const express = require("express");
const cors = require("cors");
const jsonParser = require("body-parser").json();
const logger = require("log4js").getLogger();

// Allow origins
function setHeaders(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Cookie"
  );
  return next();
}

// Web server starting
const app = express();
const corsOpt = {
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOpt));
app.use(setHeaders);
app.use(jsonParser);

// routes
app.use("/gateway", require("./routes/gateway"), require("./routes/device"));

//error handling
app.use(function (err, req, res, next) {
  logger.debug(err.details || err);
  res.status(500).send(err.message);
});

module.exports = app;
