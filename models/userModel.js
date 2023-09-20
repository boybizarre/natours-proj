const mongoose = require('mongoose');
const crypto = require('crypto');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
  },

  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true, // transforms the email to lowercase
    validate: [validator.isEmail, 'Please provide a valid email'],
  },

  photo: String,

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only works on CREATE and SAVE not update
      validator: function (password) {
        return password === this.password; // passwords must match else it returns false
      },
      message: 'Passwords do not match!',
    },
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// HASHING PASSWORD
userSchema.pre('save', async function (next) {
  //checks if password has not been modified
  if (!this.isModified('password')) return next();

  // hashing the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete the confirm password field
  this.passwordConfirm = undefined;
  next();
});

// instance method so it'll be available on all the instances of userSchema
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword); //returns true or false
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // if true password changed
  }

  // false means NOT changed
  return false;
};

userSchema.pre('save', function (next) {
  // if the password has not been modified and the document is new, return out of the middleware
  if (!this.isModified('password') || this.isNew) return next();

  // else we subtract 1 second from the timestamp incase saving to the database is slower than issuing a token
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // encrypt it
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
