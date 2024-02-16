const { validate, check } = require("express-validation");

const checkValidation = (schema) => (req, res, next) => {
  return validate(schema, {}, {})(req, res, next);
};

module.exports = checkValidation;
