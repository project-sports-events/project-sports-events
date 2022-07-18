const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("events");
});

router.get("/create-event", (req, res, next) => {
  res.render("create-event");
});

module.exports = router;
