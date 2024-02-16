const logger = require("log4js").getLogger();

const addNulls = ({ body: schema }, target = {}) => {
  Object.keys(schema.describe().keys).forEach((key) => {
    if (target[key] === undefined) target[key] = "NULL";
  });
};

const removeNulls = (obj) => {
  if (typeof obj === "object")
    return Object.entries(obj)
      .filter(([k, v]) => ![undefined, null, "NULL"].includes(v))
      .reduce(
        (acc, [key, value]) => {
          acc[key] = removeNulls(value);
          return acc;
        },
        obj.length === undefined ? {} : []
      );
  else return obj;
};

const createUpdateSQL = (tableName, object, where) =>
  `UPDATE ${tableName} SET ${Object.keys(object)
    .map((column) => column.concat(" = ?"))
    .join(",")} WHERE ${
    typeof where === object
      ? Object.keys(whereList)
          .map((column) => column.concat(" = ?"))
          .join(" AND ")
      : where.concat(" = ?")
  }`;

const getOneById = (db, query, id) =>
  new Promise((res) => {
    db.get(query, [id], (error, row) => {
      if (!row) {
        res([404]);
      }
      if (error) {
        logger.debug(error);
        res([500]);
      } else {
        res([200, removeNulls(row)]);
      }
    });
  });

module.exports = {
  addNulls,
  removeNulls,
  createUpdateSQL,
  getOneById,
};
