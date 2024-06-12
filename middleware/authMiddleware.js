const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
      return next();
  } else {
      res.redirect('/login.html?showModal=true');
  }
};

const ensureGuest = (req, res, next) => {
  if (!req.isAuthenticated()) {
      return next();
  } else {
      res.redirect('/all_events.html');
  }
};

module.exports = { ensureAuthenticated, ensureGuest };
