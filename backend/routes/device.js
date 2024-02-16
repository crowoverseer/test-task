const router = require("./gateway");
const { Joi } = require("express-validation");
const db = require("../db");
const { addNulls, createUpdateSQL, getOneById } = require("../tools/dbTools");
const logger = require("log4js").getLogger();
const checkValidation = require("../tools/checkValidation");

const deviceValidation = {
  body: Joi.object({
    UID: Joi.number().optional().allow(""),
    vendor: Joi.string().allow(""),
    status: Joi.string().valid("online", "offline").optional().allow(""),
  }),
};

const checkGatewayExisting = async (req, res, next) => {
  const [statusCode, row] = await getOneById(
    db,
    "SELECT id FROM gateways WHERE id = ?",
    req.params.gatewayId
  );
  if (!row) {
    res.statusCode = statusCode;
    res.send({ error: "Wrong gateway" });
  } else {
    next();
  }
};

const checkGatewayLimits = async (req, res, next) => {
  const query =
    "SELECT COUNT(gatewayId) as device_count FROM devices WHERE gatewayId = ?";
  db.get(query, [req.params.gatewayId], (error, row) => {
    if (error) {
      logger.debug(error);
      res.statusCode = 500;
      res.send([]);
    } else if (!row) {
      res.statusCode = 500;
      res.send({ error: "Database query error" });
    } else {
      if (Number(row.device_count) >= 10) {
        res.statusCode = 500;
        res.send({ error: "Device limit reached" });
      } else {
        next();
      }
    }
  });
};

router
  .route("/:gatewayId/devices")
  .all((req, res, next) => {
    res.statusCode = 200;
    next();
  })
  .options((req, res) => {
    res.statusCode = 200;
    res.header("Access-Control-Allow-Methods", "POST, GET");
    res.setHeader("Content-Type", "text/plain");
  })
  .post(
    checkValidation(deviceValidation),
    checkGatewayExisting,
    checkGatewayLimits,
    (req, res) => {
      res.setHeader("Content-Type", "application/json");
      db.serialize(() => {
        addNulls(deviceValidation, req.body);
        const { UID, vendor, status } = req.body;

        const stmt = db.prepare(
          "INSERT INTO devices ( UID, vendor, status, gatewayId) VALUES (?, ?, ?, ?)"
        );
        stmt.run(
          [UID, vendor, status, req.params.gatewayId],
          async function (error) {
            if (error) {
              res.statusCode = 500;
              logger.debug(error);
              res.send({ error: "Database error" });
            } else {
              res.statusCode = 200;
              const deviceId = this.lastID;
              const [statusCode, row] = await getOneById(
                db,
                "SELECT ID as id, UID, vendor, dateCreated, status FROM devices WHERE ID = ?",
                deviceId
              );
              res.statusCode = statusCode;
              if (statusCode == 200) {
                res.send(row);
              } else {
                res.send({});
              }
            }
          }
        );
        stmt.finalize();
      });
    }
  );

router
  .route("/:gatewayId/devices/:deviceId")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .options((_, res) => {
    res.statusCode = 200;
    res.header("Access-Control-Allow-Methods", "PATCH, GET");
  })
  .get(checkGatewayExisting, (req, res) => {
    res.setHeader("Content-Type", "application/json");
    db.serialize(async () => {
      const [statusCode, row] = await getOneById(
        db,
        "SELECT UID, vendor, dateCreated, status FROM devices WHERE ID = ?",
        req.params.deviceId
      );
      res.statusCode = statusCode;
      if (statusCode == 200) {
        res.send(row);
      } else {
        res.send({});
      }
    });
  })
  .patch(
    checkValidation(deviceValidation),
    checkGatewayExisting,
    (req, res) => {
      res.setHeader("Content-Type", "application/json");
      db.serialize(() => {
        addNulls(deviceValidation, req.body);
        const stmt = db.prepare(createUpdateSQL("devices", req.body, "id"));
        stmt.run(
          [...Object.values(req.body), req.params.deviceId],
          async function (error) {
            if (error) {
              res.statusCode = 500;
              logger.debug(error);
              res.send({ error: "Database error" });
            } else {
              const [statusCode, row] = await getOneById(
                db,
                "SELECT UID, vendor, dateCreated, status FROM devices WHERE ID = ?",
                req.params.deviceId
              );
              res.statusCode = statusCode;
              if (statusCode == 200) {
                res.send(row);
              } else {
                res.send({});
              }
            }
          }
        );
        stmt.finalize();
      });
    }
  )
  .delete(checkGatewayExisting, (req, res) => {
    db.serialize(async () => {
      const stmt = db.prepare("DELETE FROM devices WHERE id = ?");
      stmt.run([req.params.deviceId]);
      stmt.finalize();
      res.send("");
    });
  });

module.exports = router;
