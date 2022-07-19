const router = require("express").Router();
const Event = require("../models/Event.model");
/* GET home page */

router.get("/", (req, res, next) => {
  Event.find().then((data) => {
    // console.log({ data });
    // const id = data._id;
    // console.log(id);
    res.render("events", { data });
  });
});

router.get("/create-event", (req, res, next) => {
  res.render("create-event");
});

router.post("/create-event", (req, res, next) => {
  // console.log(req.body);
  const { typeOfSport, title, location, numberOfRequiredPlayers, price, date } =
    req.body;
  const author = req.session.user._id;

  Event.create({
    typeOfSport,
    title,
    location,
    numberOfRequiredPlayers,
    price,
    author,
    date,
  })
    .then((data) => {
      console.log(data);
      data.players.push(data.author);
      data.save();
      Event.find().then((data) => {
        console.log(data);
        res.redirect("/events"), { data };
      });
    })
    // .then(
    //   (data) => console.log("Saved into the database! ", data),
    //   res.redirect("/events")
    // )
    .catch((err) => {
      console.log(err);
    });

  // console.log(typeOfSport);
});

router.get("/:id", (req, res, next) => {
  // console.log(req.params);
  const { id } = req.params;
  // console.log(id);
  Event.findById(id)
    .populate("players")
    .then((data) => {
      // console.log(data);
      res.render("event-details", data);
    });
});

router.post("/:id", (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.session.user._id;

  Event.findById(eventId).then((data) => {
    const playersArr = data.players;
    console.log(playersArr.indexOf(userId));
    console.log(data.author);
    if (data.numberOfRequiredPlayers > 0) {
      if (playersArr.indexOf(userId) === -1) {
        data.players.push(userId);
        data.numberOfRequiredPlayers -= 1;
        data.save();
        res.redirect("/profile");
      } else {
        console.log("user already exists");
        res.redirect("/profile");
      }
    } else {
      console.log("player list is full");
      res.redirect(`/events/${eventId}`);
    }

    // console.log(playersArr);
  });
});

module.exports = router;
