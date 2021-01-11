const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(5)
    .max(30)
    .required()
    .error(() => Error('Username has to be least 5 and max 30 characters.')),
  password: Joi.string()
    .min(5)
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .required()
    .error(() =>
      Error(
        'Password has to be least 5 characters and contain alphanumeric only.'
      )
    ),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    })
    .required()
    .error(() => Error('Invalid email.')),
});

module.exports = userSchema;
