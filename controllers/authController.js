/* eslint-disable import/no-extraneous-dependencies */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendMail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // makes sure that the cookie is only sent on an encrypted connection https
    // secure: true,
    // makes sure that cookie cannot be accessed or modified anywhere by the browser. prevents cross side scripting attack
    // httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // remove the password field
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide an email and password!', 400));
  }

  // 2) check if user exist and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    // instance method
    return next(new AppError('Incorrect email or password', 401));
  }
  //  3) return token if every check passed
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check it it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      next(
        new AppError(
          'You are not logged in! Please log in to get access.',
          401,
        ),
      ),
    );
  }
  // 2) verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  // 3) check if user still exist incase of user changing password or stole token
  // using decoded.id we can verify we are selecting the user for which we verified a token for
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401),
    );
  }
  // 4) check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    // instance method
    return next(
      new AppError('User recently changed password! Please log in again', 401),
    );
  }

  // grant access to the protected route
  req.user = freshUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // console.log(resetToken);

  // 3) Send it to user email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

  console.log(message);

  // using the try catch block because i want to reset the token and expires field before sending the error message
  try {
    await sendMail({
      email: user.email,
      subject: 'Your password reset token (valid for 10mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try again later!',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on token in the url
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // checking also if the password reset link hasn't expired (password reset token)
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }

  //  2) if token has not expired, and there is user, set the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) update changedPasswordAt property for the user

  // 4) log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //  1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong!', 401));
  }

  // 3) if so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //

  // 4) log user in, send JWT
  createSendToken(user, 200, res);
});
