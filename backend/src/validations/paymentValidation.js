const Joi = require('joi');

// Initialize payment validation
exports.initializePaymentValidation = (data) => {
  const schema = Joi.object({
    paymentMethod: Joi.string()
      .valid('card', 'bank_transfer', 'cash')
      .default('card'),
    
    metadata: Joi.object()
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

// Report generation validation
exports.reportValidation = (data) => {
  const schema = Joi.object({
    type: Joi.string()
      .valid('occupancy', 'payments', 'complaints', 'students')
      .required()
      .messages({
        'any.only': 'Invalid report type',
        'any.required': 'Report type is required'
      }),
    
    startDate: Joi.date()
      .iso()
      .required()
      .messages({
        'date.base': 'Start date must be a valid date',
        'any.required': 'Start date is required'
      }),
    
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .required()
      .messages({
        'date.base': 'End date must be a valid date',
        'date.min': 'End date must be after start date',
        'any.required': 'End date is required'
      }),
    
    format: Joi.string()
      .valid('json', 'csv', 'pdf')
      .default('json')
  });

  return schema.validate(data, { abortEarly: false });
};
