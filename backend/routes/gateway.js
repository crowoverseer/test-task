const express = require("express");
const router = express.Router();
const { Joi } = require("express-validation");
const db = require("../db");
const logger = require("log4js").getLogger();
const {
  addNulls,
  createUpdateSQL,
  getOneById,
  removeNulls,
} = require("../tools/dbTools");
const checkValidation = require("../tools/checkValidation");

const gatewayValidation = {
  body: Joi.object({
    serial: Joi.string().allow(""),
    name: Joi.string().allow(""),
    ipv4: Joi.string()
      .regex(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/)
      .required(),
  }),
};

router
  .route("/")
  .all((_, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .options((_, res) => {
    res.statusCode = 200;
    res.header("Access-Control-Allow-Methods", "POST, GET");
  })
  .get((_, res) => {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    db.serialize(() => {
      const query =
        "SELECT gateways.ID as ID, serial, name, ipv4, devices.ID as deviceID, UID, vendor, dateCreated, status FROM gateways LEFT JOIN devices ON devices.gatewayId = gateways.ID";
      db.all(query, (error, rows) => {
        if (!rows) {
          res.send([]);
        } else if (error) {
          logger.debug(error);
          res.statusCode = 500;
          res.send([]);
        } else {
          const result = rows.reduce((acc, row) => {
            const {
              ID,
              serial,
              name,
              ipv4,
              deviceID,
              UID,
              vendor,
              dateCreated,
              status,
            } = row;
            if (acc.has(ID)) {
              acc.get(ID).devices.push({
                deviceID,
                UID,
                vendor,
                dateCreated,
                status,
              });
            } else {
              acc.set(ID, {
                ID,
                serial,
                name,
                ipv4,
                devices: dateCreated
                  ? [
                      {
                        deviceID,
                        UID,
                        vendor,
                        dateCreated,
                        status,
                      },
                    ]
                  : [],
              });
            }
            return acc;
          }, new Map());
          res.send(removeNulls(Array.from(result.values())));
        }
      });
    });
  })
  .post(checkValidation(gatewayValidation), (req, res) => {
    res.setHeader("Content-Type", "application/json");
    db.serialize(() => {
      addNulls(gatewayValidation, req.body);
      const { serial, name, ipv4 } = req.body;

      const stmt = db.prepare(
        "INSERT INTO gateways ( serial, name, ipv4 ) VALUES (?, ?, ?)"
      );
      stmt.run([serial, name, ipv4], function (error) {
        if (error) {
          res.statusCode = 500;
          logger.debug(error);
          res.send({ error: "Database error. Check if serial is unique" });
        } else {
          res.statusCode = 200;
          res.json(
            removeNulls({
              id: this.lastID,
              serial,
              name,
              ipv4,
            })
          );
        }
      });
      stmt.finalize();
    });
  });

router
  .route("/:id")
  .all((_, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .options((_, res) => {
    res.statusCode = 200;
    res.header("Access-Control-Allow-Methods", "PATCH, GET");
  })
  .get((req, res) => {
    res.setHeader("Content-Type", "application/json");
    db.serialize(async () => {
      const [statusCode, gatewayRow] = await getOneById(
        db,
        "SELECT serial, name, ipv4 FROM gateways WHERE ID = ?",
        req.params.id
      );
      res.statusCode = statusCode;
      if (statusCode == 200) {
        gatewayRow.devices = [];
        db.all(
          "SELECT UID, vendor, dateCreated, status FROM devices WHERE gatewayId = ?",
          [req.params.id],
          (error, rows) => {
            if (rows) {
              rows.forEach((row) => {
                gatewayRow.devices.push(row);
              });
            }
            res.send(removeNulls(gatewayRow));
          }
        );
      } else {
        res.send({});
      }
    });
  })
  .patch(checkValidation(gatewayValidation), (req, res) => {
    res.setHeader("Content-Type", "application/json");
    db.serialize(() => {
      addNulls(gatewayValidation, req.body);
      const stmt = db.prepare(createUpdateSQL("gateways", req.body, "id"));
      stmt.run(
        [...Object.values(req.body), req.params.id],
        async function (error) {
          if (error) {
            res.statusCode = 500;
            logger.debug(error);
            res.send({ error: "Database error" });
          } else {
            const [statusCode, row] = await getOneById(
              db,
              "SELECT serial, name, ipv4 FROM gateways WHERE ID = ?",
              req.params.id
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
  })
  .delete((req, res) => {
    db.serialize(async () => {
      let stmt = db.prepare("DELETE FROM gateways WHERE id = ?");
      stmt.run([req.params.id]);
      // in node sql a cascade deletion bug is exists
      stmt = db.prepare("DELETE FROM devices WHERE gatewayId = ?");
      stmt.run([req.params.id]);
      stmt.finalize();
      res.send("");
    });
  });

module.exports = router;
