/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');

const morgan = require('morgan');

const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorControllers');

const app = express();

const tourRouter = require('./routes/tourRoutes');

const userRouter = require('./routes/userRoutes');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// implementing rate limiter for IP addresses
const limiter = rateLimit({
  max: 3,
  windowMs: 60 * 60 * 1000, // one hour window
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(express.json());

// serving static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// this should be the last part of all our middleware and routes
app.use('*', (req, res, next) => {
  // whatever is passed into the next function is recognized as an error
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
