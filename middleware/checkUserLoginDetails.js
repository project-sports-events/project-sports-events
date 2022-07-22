module.exports = (req, res, next) => {
  // checks if the user is logged in when trying to access a specific page

  res.locals.session = req.session.user;
  console.log(res.locals.session);

  next();
};
