const express = require('express');

const router = express.Router();

const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

router.get('/me', authController.protect, viewsController.getAccount);

module.exports = router;
