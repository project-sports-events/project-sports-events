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

router.get("/search", (req, res, next) => {
  console.log(req.query);
  const { typeOfSport, location, price } = req.query;
  console.log(typeOfSport);
  console.log(location);
  console.log(price);

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

  console.log(filterObj);
  if (!filterObj) {
    res.redirect("/events");
  } else {
    Event.find(filterObj)
      .then((data) => {
        console.log(data);
        res.render("events-search", { data });
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
  const userId = req.session.user._id;
  // console.log(userId);
  // console.log(id);
  Event.findById(id)
    .populate("players")
    .then((data) => {
      const dataObj = data;
      const playersArr = data.players;
      let isBooked = false;
      playersArr.forEach((element) => {
        if (element._id == userId) {
          isBooked = true;
        }
      });
      // console.log("this is playersArr", playersArr);
      // console.log(data.isBooked);
      dataObj.isBooked = isBooked;
      console.log(dataObj.date);
      const dateFromObj = JSON.stringify(dataObj.date);

      console.log(dateFromObj);
      const dateString = dateFromObj.substring(1, dateFromObj.indexOf("T"));
      const timeString = dateFromObj.substring(12, 17);
      dataObj.dateString = dateString;
      dataObj.timeString = timeString;
      res.render("event-details", dataObj);
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

//filter form

module.exports = router;
