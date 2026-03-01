const Joi = require('joi');

// Create ticket validation
exports.createTicketValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string()
      .min(5)
      .max(100)
      .required()
      .messages({
        'string.min': 'Title must be at least 5 characters',
        'string.max': 'Title cannot exceed 100 characters',
        'any.required': 'Title is required'
      }),
    
    description: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description cannot exceed 1000 characters',
        'any.required': 'Description is required'
      }),
    
    category: Joi.string()
      .valid(
        'electrical', 'plumbing', 'furniture', 'cleaning',
        'security', 'internet', 'structural', 'pest_control', 'other'
      )
      .required()
      .messages({
        'any.only': 'Please select a valid category',
        'any.required': 'Category is required'
      }),
    
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'emergency')
      .default('medium')
  });

  return schema.validate(data, { abortEarly: false });
};

// Update ticket validation (Admin)
exports.updateTicketValidation = (data) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'),
    
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'emergency'),
    
    assignedTo: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.pattern.base': 'Invalid user ID format'
      }),
    
    resolution: Joi.string()
      .max(500)
      .optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  });

  return schema.validate(data, { abortEarly: false });
};

// Comment validation
exports.commentValidation = (data) => {
  const schema = Joi.object({
    comment: Joi.string()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.min': 'Comment cannot be empty',
        'string.max': 'Comment cannot exceed 500 characters',
        'any.required': 'Comment is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};
