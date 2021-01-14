import Joi from "joi";

export const userSchema = Joi.object({
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
});
