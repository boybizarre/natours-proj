const mongoose = require('mongoose');
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

const User = mongoose.model('User', userSchema);

module.exports = User;
