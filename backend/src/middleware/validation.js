const {
  registerValidation,
  loginValidation,
  changePasswordValidation
} = require('../validations/authValidation');

const {
  createRoomValidation,
  updateRoomValidation,
  applyRoomValidation
} = require('../validations/roomValidation');

const {
  createTicketValidation,
  updateTicketValidation,
  commentValidation
} = require('../validations/ticketValidation');

const {
  initializePaymentValidation,
  reportValidation
} = require('../validations/paymentValidation');

// Generic validation middleware
const validate = (validationFunction) => {
  return (req, res, next) => {
    const { error } = validationFunction(req.body);
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Export specific validators
module.exports = {
  // Auth validations
  validateRegister: validate(registerValidation),
  validateLogin: validate(loginValidation),
  validateChangePassword: validate(changePasswordValidation),
  
  // Room validations
  validateCreateRoom: validate(createRoomValidation),
  validateUpdateRoom: validate(updateRoomValidation),
  validateApplyRoom: validate(applyRoomValidation),
  
  // Ticket validations
  validateCreateTicket: validate(createTicketValidation),
  validateUpdateTicket: validate(updateTicketValidation),
  validateComment: validate(commentValidation),
  
  // Payment validations
  validateInitializePayment: validate(initializePaymentValidation),
  validateReport: validate(reportValidation)
};
