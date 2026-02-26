const Joi = require('joi');

// Register validation
exports.registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.min': 'Name must be at least 3 characters',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required'
      }),
    
    matricNumber: Joi.string()
      .pattern(/^[A-Z0-9]{6,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'Matric number must be 6-15 alphanumeric characters',
        'any.required': 'Matric number is required'
      }),
    
    password: Joi.string()
      .min(6)
      .max(30)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'string.max': 'Password cannot exceed 30 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    
    phoneNumber: Joi.string()
      .pattern(/^[+]?[\d\s-]{10,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    gender: Joi.string()
      .valid('male', 'female', 'other')
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

// Login validation
exports.loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Change password validation
exports.changePasswordValidation = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    
    newPassword: Joi.string()
      .min(6)
      .max(30)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'New password must be at least 6 characters',
        'string.max': 'New password cannot exceed 30 characters',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'New password is required'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password'
      })
  });

  return schema.validate(data, { abortEarly: false });
};
