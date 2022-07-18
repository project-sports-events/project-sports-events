const router = require("express").Router();
const User = require("../models/User.model");
const userLogin = require("../middleware/isLoggedIn");

/* GET home page */
router.get("/", userLogin, (req, res, next) => {
  res.render("profile");
});

module.exports = router;
