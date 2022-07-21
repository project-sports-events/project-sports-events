const router = require("express").Router();
const Event = require("../models/Event.model");
// const isLoggedIn = require("../middleware/isLoggedIn");
/* GET home page */

router.get("/", (req, res, next) => {
  Event.find()
    .then((data) => {
      const eventsPending = [];
      data.forEach((element) => {
        // console.log(element.numberOfRequiredPlayers);
        if (element.numberOfRequiredPlayers > 0) {
          eventsPending.push(element);
        }
      });
      return eventsPending;
    })
    .then((eventsPending) => {
      console.log("these are ", eventsPending);
      res.render("events", { eventsPending });
    });
});

router.get("/search", (req, res, next) => {
  const { typeOfSport, location, price } = req.query;

  const filterObj = {};

  if (location) {
    filterObj.location = location;
  }

  if (typeOfSport) {
    filterObj.typeOfSport = typeOfSport;
  }

  if (price) {
    filterObj.price = price;
  }

  if (!filterObj) {
    res.redirect("/events");
  } else {
    Event.find(filterObj)
      .then((data) => {
        const eventsPending = [];
        data.forEach((element) => {
          // console.log(element.numberOfRequiredPlayers);
          if (element.numberOfRequiredPlayers > 0) {
            eventsPending.push(element);
          }
        });
        return eventsPending;
      })
      .then((eventsPending) => {
        res.render("events", { eventsPending });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.get("/create", (req, res, next) => {
  res.render("create-event");
});

router.post("/create", (req, res, next) => {
  // console.log(req.body);
  const {
    typeOfSport,
    title,
    location,
    numberOfRequiredPlayers,
    price,
    date,
    time,
  } = req.body;
  const author = req.session.user._id;

  Event.create({
    typeOfSport,
    title,
    location,
    numberOfRequiredPlayers,
    price,
    author,
    date,
    time,
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
  const userId = req.session.user._id;
  // console.log(userId);
  // console.log(id);
  Event.findById(id)
    .populate("players")
    .populate("author")
    .then((data) => {
      const playersArr = data.players;
      let isBooked = false;
      playersArr.forEach((element) => {
        if (element._id == userId) {
          isBooked = true;
        }
      });
      // console.log("this is playersArr", playersArr);
      // console.log(data.isBooked);
      data.isBooked = isBooked;

      res.render("event-details", data);
    });
});

router.post("/:id/book", (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.session.user._id;

  Event.findById(eventId).then((data) => {
    console.log(data);
    const playersArr = data.players;
    // console.log(playersArr.indexOf(userId));
    // console.log(data.author);
    //check if user has already booked
    let isBooked = false;
    if (data.numberOfRequiredPlayers > 0) {
      if (playersArr.indexOf(userId) === -1) {
        data.players.push(userId);
        data.numberOfRequiredPlayers -= 1;
        data.save();
        res.redirect(`/events/${eventId}`);
        // res.redirect("/profile");
      } else {
        console.log("user already exists");
        res.redirect(`/events/${eventId}`);
      }
    } else {
      console.log("player list is full");
      res.redirect(`/events/${eventId}`);
    }

    // console.log(playersArr);
  });
});

// form edit:
router.get("/:id/event-edit", (req, res, next) => {
  const eventId = req.params.id;
  console.log(eventId);
  Event.findById(eventId)
    .then((data) => {
      console.log("this is ", data);
      // console.log(data.date);

      res.render("event-edit", data);
    })
    .catch((error) => next(error));
});

router.post("/:id/event-edit", (req, res, next) => {
  const eventId = req.params.id;
  const {
    typeOfSport,
    title,
    location,
    numberOfRequiredPlayers,
    price,
    author,
    date,
    time,
  } = req.body;
  Event.findByIdAndUpdate(
    eventId,
    {
      typeOfSport,
      title,
      location,
      numberOfRequiredPlayers,
      price,
      author,
      date,
      time,
    },
    { new: true }
  )
    .then((data) => res.redirect(`/events/${eventId}`))
    .catch((error) => next(error));
});

module.exports = router;

// form delete:
router.post("/:id/event-delete", (req, res, next) => {
  const eventId = req.params.id;
  Event.findByIdAndDelete(eventId)
    .then(() => res.redirect("/"))
    .catch((error) => next(error));
});
