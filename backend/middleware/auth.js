const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token (default export as a function to satisfy tests)
const authenticateToken = async (req, res, next) => {
  try {
    // Tests use req.header('Authorization'), support both header access patterns
    const rawHeader = typeof req.header === 'function' ? req.header('Authorization') : (req.headers && req.headers.authorization);
    if (!rawHeader || !rawHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = rawHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid' });
      }

      // Optional: enforce active accounts
      if (user.isActive === false) {
        return res.status(401).json({ message: 'Token is not valid' });
      }

      req.user = user;
      return next();
    } catch (dbErr) {
      return res.status(500).json({ message: 'Server error' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }
  next();
};

// Check if user is student (legacy - use requireStudentOrClassRep instead)
const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      status: 'error',
      message: 'Student access required'
    });
  }
  next();
};

// Check if user is student or class representative
const requireStudentOrClassRep = (req, res, next) => {
  if (req.user.role !== 'student' && req.user.role !== 'class-representative') {
    return res.status(403).json({
      status: 'error',
      message: 'Student or Class Representative access required'
    });
  }
  next();
};

// Optional authentication (for public routes that can use user info if available)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Check if user can access resource (owner or admin)
const checkResourceAccess = (resourceUserIdField = 'studentId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Students can only access their own resources
    if (req.user._id.toString() === resourceUserId) {
      return next();
    }
    
    return res.status(403).json({
      status: 'error',
      message: 'Access denied - insufficient permissions'
    });
  };
};

// Dual export strategy: default is the middleware function (for tests)
// and named properties for route imports in the app
module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.requireAdmin = requireAdmin;
module.exports.requireStudent = requireStudent;
module.exports.requireStudentOrClassRep = requireStudentOrClassRep;
module.exports.optionalAuth = optionalAuth;
module.exports.generateToken = generateToken;
module.exports.checkResourceAccess = checkResourceAccess;
