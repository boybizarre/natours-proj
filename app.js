/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');

const morgan = require('morgan');

const rateLimit = require('express-rate-limit');

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp');

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorControllers');

const app = express();

// GLOBAL MIDDLEWARES
// 1) set security http headers
app.use(helmet());

const tourRouter = require('./routes/tourRoutes');

const userRouter = require('./routes/userRoutes');

const reviewRouter = require('./routes/reviewRoutes');

// 2) Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3) implementing rate limiter for IP addresses
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // one hour window
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// 4) body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// 5) data sanitization against noSQL query injection
app.use(mongoSanitize());

// 6) data sanitization against xss
app.use(xss());

// 7) prevents from parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// 8) serving static files
app.use(express.static(`${__dirname}/public`));

// 9) test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// mounting routers on paths
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// this should be the last part of all our middleware and routes
app.use('*', (req, res, next) => {
  // whatever is passed into the next function is recognized as an error
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
