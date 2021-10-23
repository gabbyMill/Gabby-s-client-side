const fs = require("fs");
const path = require("path");

module.exports.userHandler = function (req, res, next) {
  const { username } = req.headers;
  if (!username) throw { status: 401, message: "No username" };

  const userPath = path.resolve(path.join("./users", username));
  if (!fs.existsSync(userPath)) fs.mkdirSync(userPath);
  req.username = username;
  next();
};
