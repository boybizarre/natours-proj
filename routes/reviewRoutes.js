const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// redirects parameter in tourRouter where reviewRouter is called
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );

module.exports = router;
