const AuditLog = require('../models/AuditLog');

// Middleware to log user actions
const auditLogger = (action) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method
    res.json = function(data) {
      // Log after response is sent
      setImmediate(async () => {
        try {
          if (req.user && data.success !== false) {
            await AuditLog.create({
              user: req.user._id,
              action,
              details: `${action} performed by ${req.user.name}`,
              ip: req.ip,
              userAgent: req.get('User-Agent'),
              metadata: {
                method: req.method,
                path: req.path,
                body: req.body,
                responseStatus: res.statusCode
              }
            });
          }
        } catch (error) {
          console.error('Audit log error:', error);
        }
      });
      
      // Call original json method
      originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = auditLogger;