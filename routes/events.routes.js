const router = require("express").Router();
const { events } = require("../models/Event.model");
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
      const chosenSportsArr = [];

      console.log(eventsPending);
      eventsPending.forEach((element) => {
        if (element.typeOfSport === "football") {
          chosenSportsArr.push("9917");
        } else if (element.typeOfSport === "tennis") {
          chosenSportsArr.push("127934");
        } else if (element.typeOfSport === "basketball") {
          chosenSportsArr.push("127936");
        }
      });

      const eventDates = [];
      const difference = [];
      let date_2 = new Date();
      // console.log(date_2);
      eventsPending.forEach((element) => {
        eventDates.push(new Date(element.date));
      });

      eventDates.forEach((element) => {
        difference.push(element.getTime() - date_2.getTime());
      });

      const totalDays = [];
      difference.forEach((element) => {
        let totalDaysCalc = Math.ceil(element / (1000 * 3600 * 24));
        totalDays.push(totalDaysCalc);
      });

      for (let i = 0; i < eventsPending.length; i++) {
        eventsPending[i].daysLeft = totalDays[i];
        eventsPending[i].chosenSport = chosenSportsArr[i];
      }
      //CHECK TYPE OF SPORT
      console.log("im here now, ", eventsPending[0].chosenSport);
      res.render("events", { eventsPending });
    });
});

router.get("/search", (req, res, next) => {
  console.log(req.query);
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
        const eventDates = [];
        const difference = [];
        let date_2 = new Date();
        // console.log(date_2);
        eventsPending.forEach((element) => {
          eventDates.push(new Date(element.date));
        });

        eventDates.forEach((element) => {
          difference.push(element.getTime() - date_2.getTime());
        });

        const totalDays = [];
        difference.forEach((element) => {
          let totalDaysCalc = Math.ceil(element / (1000 * 3600 * 24));
          totalDays.push(totalDaysCalc);
        });

        for (let i = 0; i < eventsPending.length; i++) {
          eventsPending[i].daysLeft = totalDays[i];
          console.log(eventsPending[i].daysLeft);
        }
        res.render("events", { eventsPending });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.get("/sort", (req, res, next) => {
  console.log(req.query);
  const { sortEvent } = req.query;
  console.log(sortEvent);
  Event.find({})
    .sort(sortEvent)
    .then((data) => {
      const eventsPending = [];
      data.forEach((element) => {
        eventsPending.push(element);
      });
      return eventsPending;
    })
    .then((eventsPending) => {
      const eventDates = [];
      const difference = [];
      let date_2 = new Date();
      // console.log(date_2);
      eventsPending.forEach((element) => {
        eventDates.push(new Date(element.date));
      });

      eventDates.forEach((element) => {
        difference.push(element.getTime() - date_2.getTime());
      });

      const totalDays = [];
      difference.forEach((element) => {
        let totalDaysCalc = Math.ceil(element / (1000 * 3600 * 24));
        totalDays.push(totalDaysCalc);
      });

      for (let i = 0; i < eventsPending.length; i++) {
        eventsPending[i].daysLeft = totalDays[i];
        console.log(eventsPending[i].daysLeft);
      }
      res.render("events", { eventsPending });
    });
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
      let isCreator = false;
      console.log("im here", data);
      console.log(data.author._id);
      if (data.author._id == userId) {
        isCreator = true;
      }
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
      data.isCreator = isCreator;
      console.log("i am here now", data);
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

//Remove user from booking

router.post("/:id/cancel", (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.session.user._id;

  Event.findById(eventId).then((data) => {
    // console.log("this is ", data);
    const playersArr = data.players;
    let isCreator = false;

    if (playersArr.indexOf(userId) > -1) {
      let userIndexPosition = playersArr.indexOf(userId);
      data.players.splice(userIndexPosition, 1);
      data.numberOfRequiredPlayers += 1;
      data.save();
      res.redirect(`/events/${eventId}`);
    }
  });
});

// form edit:
router.get("/:id/edit", (req, res, next) => {
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

router.post("/:id/edit", (req, res, next) => {
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

// form delete:
router.post("/:id/delete", (req, res, next) => {
  const eventId = req.params.id;
  Event.findByIdAndDelete(eventId)
    .then(() => res.redirect("/events"))
    .catch((error) => next(error));
});

module.exports = router;
