const {
  uniqueNamesGenerator,
  colors,
  animals,
} = require("unique-names-generator");

const { titleCase } = require("title-case");

module.exports = function () {
  // red_panda
  const randomName = uniqueNamesGenerator({ dictionaries: [colors, animals] });
  // Red Panda
  return titleCase(randomName.replace(/_/g, " "));
};
