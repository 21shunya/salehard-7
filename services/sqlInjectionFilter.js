const sqlInjectionFilter = (word) => {
  if (typeof word == "undefined") {
    return false;
  }
  if (word.indexOf("--") != -1) {
    return true;
  }
  if (word.indexOf(";") != -1) {
    return true;
  }
  if (word.indexOf("*") != -1) {
    return true;
  }
  if (word.indexOf("//") != -1) {
    return true;
  }
  if (word.indexOf("'") != -1) {
    return true;
  }
  if (word.indexOf('"') != -1) {
    return true;
  }
  if (word.indexOf("as") != -1) {
    return true;
  }
  if (word.indexOf("#") != -1) {
    return true;
  }
  if (word.indexOf("UNION") != -1) {
    return true;
  }
  if (word.indexOf("/*") != -1) {
    return true;
  }
  if (word.indexOf("/*") != -1) {
    return true;
  }
  if (word.indexOf("*/") != -1) {
    return true;
  }
  if (word.indexOf("/*") != -1) {
    return true;
  }
  return false;
};

module.exports = { sqlInjectionFilter };
