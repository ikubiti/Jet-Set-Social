const router = require('express').Router();
const { Trips, Users, Images} = require('../models');
const withAuth = require('../utils/auth');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Homepage View Render
router.get('/', async (req, res) => {
  try {
    // Get all Image Data and JOIN with user data
    const imageData = await Images.findAll({
      include: [
        {
          model: Users,
          attributes: ['name'],
        },
        {
          model: Trips,
          attributes: ['name']
        }
      ],
    });

    // Serialize data so the template can read it
    const images = imageData.map((image) => image.get({ plain: true }));

    // Pass serialized data and session flag into template
    res.render('homepage', { 
      images, 
      logged_in: req.session.logged_in 
    });
  } catch (err) {res.status(500).json(err)};
});

// Get route for the search bar results
router.get('/search/:search', async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const searchUserData = await Users.findAll({
      where: {
        [Op.or]: [
          {username: {[Op.like]: '%' + `${req.params.search}` + '%'}},
          {name: {[Op.like]: '%' + `${req.params.search}` + '%'}},
      ]},
      attributes: { exclude: ['password'] },
    });

    const searchTripData = await Trips.findAll({
      where:{name: '%' + `${req.params.name}` + '%'},
    });

    if(!searchUserData && searchTripData) {return {message: "No Users or Trips found with this Name"}}
    
    const user = searchUserData.map((users) => users.get({ plain: true }));
    const trip = searchTripData.map((trips) => trips.get({ plain: true }));
    console.log(user);
    
    res.render('search', {
      user,
      trip,
      hasUsers: true,
      hasTrips: true,
      logged_in: true
    });
  } catch (err) {res.status(500).json(err), console.log(err)};
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }

  res.render('login', {
    loginRender: true
  });
});

// Register new users
router.get('/signup', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }

  res.render('registration', {
    loginRender: true
  });
});

module.exports = router;
