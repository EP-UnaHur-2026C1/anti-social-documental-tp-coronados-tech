const path = require("path");
const i18n = require("i18n");

const locale = process.env.IDIOMA || "es";

i18n.configure({
  locales: ["es"],
  directory: path.join(__dirname, "../locales"),
  defaultLocale: locale,
  autoReload: true,
  updateFiles: false,
});

module.exports = i18n;
