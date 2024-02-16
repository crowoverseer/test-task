const CracoAlias = require("craco-alias");
const sassLoader = require("craco-sass-resources-loader");
const path = require("path");

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: "tsconfig",
        baseUrl: ".",
        tsConfigPath: "./tsconfig.path.json",
      },
    },
    {
      plugin: sassLoader,
      options: {
        resources: "./src/constants/style-constants.sass",
      },
    },
  ],

  webpack: {
    alias: {
      "@comp": path.resolve(__dirname, "src/components/"),
      "@const": path.resolve(__dirname, "src/constants/"),
    },
  },

  jest: {
    configure: {
      moduleNameMapper: {
        "^@comp(.*)$": "<rootDir>/src/components$1",
        "^@const(.*)$": "<rootDir>/src/constants$1",
      },
    },
  },
};
