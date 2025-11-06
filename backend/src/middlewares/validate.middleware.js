import { errorResponse } from '../utils/response.util.js';

// Simple Joi validation middleware generator
// Usage: validate(schema) -> middleware that validates req.body
export const validate = (schema) => {
  return (req, res, next) => {
    if (!schema) return next();

    const options = { abortEarly: false, allowUnknown: true, stripUnknown: true };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return errorResponse(res, message, 400);
    }

    // replace req.body with the validated & sanitized value
    req.body = value;
    next();
  };
};
