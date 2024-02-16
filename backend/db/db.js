const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("db/db.sqlite");

const createGatewaysTable =
  "CREATE TABLE IF NOT EXISTS gateways(\
    ID INTEGER CONSTRAINT 'PK_gateways' PRIMARY KEY AUTOINCREMENT,\
    serial TEXT UNIQUE,\
    name TEXT,\
    ipv4 TEXT\
);";

const createDevicesTable =
  "CREATE TABLE IF NOT EXISTS devices (\
    ID INTEGER CONSTRAINT 'PK_devices' PRIMARY KEY AUTOINCREMENT,\
    UID INTEGER,\
    vendor TEXT,\
    dateCreated DATETIME NOT NULL DEFAULT current_timestamp,\
    status TEXT CHECK( status IN ('online','offline', NULL) ),\
    gatewayId INTEGER NOT NULL,\
    CONSTRAINT 'FK_devices_gateways' FOREIGN KEY ('gatewayId') REFERENCES gateways(ID) ON DELETE CASCADE\
);";

db.serialize(() => {
  // db.run("DROP TABLE devices");
  // db.run("DROP TABLE gateways");
  db.run(createGatewaysTable);
  db.run(createDevicesTable);
});

module.exports = db;
