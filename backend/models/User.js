const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        // Check if email is valid format and from PSG Tech domain
        const emailRegex = /^[a-zA-Z0-9._%+-]+@psgtech\.ac\.in$/i;
        return emailRegex.test(email);
      },
      message: 'Email must be a valid @psgtech.ac.in address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['student', 'class-representative', 'admin'],
    default: 'student'
  },
  department: {
    type: String,
    trim: true,
    required: true,
    enum: ['Computer Science', 'Mechanical Engineering', 'Information Technology', 'Civil Engineering', 'Administration'],
    default: 'Computer Science'
  },
  year: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', '5th'],
    default: '1st'
  },
  className: {
    type: String,
    trim: true,
    required: function() {
      return this.role !== 'admin';
    },
    validate: {
      validator: function(value) {
        if (this.role === 'admin') return true;
        
        // For Computer Science: G1, G2, AIML allowed
        if (this.department === 'Computer Science') {
          return ['G1', 'G2', 'AIML'].includes(value);
        }
        // For other departments: only G1, G2 allowed
        else {
          return ['G1', 'G2'].includes(value);
        }
      },
      message: function(props) {
        if (props.instance.department === 'Computer Science') {
          return 'Class must be G1, G2, or AIML for Computer Science';
        }
        return 'Class must be G1 or G2 for this department';
      }
    }
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: function() {
      // Only class representatives require approval; students and admins are approved by default
      return this.role !== 'class-representative';
    }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ rollNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
