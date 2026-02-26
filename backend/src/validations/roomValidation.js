const Joi = require('joi');

// Create room validation
exports.createRoomValidation = (data) => {
  const schema = Joi.object({
    roomNumber: Joi.string()
      .required()
      .uppercase()
      .pattern(/^[A-Z0-9-]+$/)
      .messages({
        'string.pattern.base': 'Room number must be alphanumeric with optional hyphens',
        'any.required': 'Room number is required'
      }),
    
    blockName: Joi.string()
      .required()
      .uppercase()
      .messages({
        'any.required': 'Block name is required'
      }),
    
    floorNumber: Joi.number()
      .integer()
      .min(0)
      .max(20)
      .required()
      .messages({
        'number.min': 'Floor number cannot be negative',
        'number.max': 'Floor number cannot exceed 20',
        'any.required': 'Floor number is required'
      }),
    
    capacity: Joi.number()
      .integer()
      .min(1)
      .max(6)
      .required()
      .messages({
        'number.min': 'Capacity must be at least 1',
        'number.max': 'Capacity cannot exceed 6',
        'any.required': 'Capacity is required'
      }),
    
    genderRestriction: Joi.string()
      .valid('male', 'female', 'any')
      .default('any'),
    
    price: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Price must be positive',
        'any.required': 'Price is required'
      }),
    
    amenities: Joi.array()
      .items(Joi.string().valid(
        'bed', 'mattress', 'wardrobe', 'desk', 
        'chair', 'fan', 'ac', 'wifi', 'attached_bathroom'
      )),
    
    description: Joi.string()
      .max(500)
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

// Update room validation
exports.updateRoomValidation = (data) => {
  const schema = Joi.object({
    roomNumber: Joi.string().uppercase().pattern(/^[A-Z0-9-]+$/),
    blockName: Joi.string().uppercase(),
    floorNumber: Joi.number().integer().min(0).max(20),
    capacity: Joi.number().integer().min(1).max(6),
    genderRestriction: Joi.string().valid('male', 'female', 'any'),
    price: Joi.number().positive(),
    amenities: Joi.array().items(Joi.string().valid(
      'bed', 'mattress', 'wardrobe', 'desk', 
      'chair', 'fan', 'ac', 'wifi', 'attached_bathroom'
    )),
    status: Joi.string().valid('available', 'occupied', 'maintenance', 'full'),
    description: Joi.string().max(500)
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  });

  return schema.validate(data, { abortEarly: false });
};

// Room application validation
exports.applyRoomValidation = (data) => {
  const schema = Joi.object({
    preferredRoomType: Joi.string()
      .valid('single', 'double', 'triple', 'quad', 'any')
      .default('any'),
    
    maxPrice: Joi.number()
      .positive()
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};
