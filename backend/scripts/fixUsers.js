const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const fixExistingUsers = async () => {
  try {
    console.log('🔧 Starting user data migration...');

    // Find all users with invalid departments
    const invalidDeptUsers = await User.find({
      department: { 
        $nin: ['Computer Science', 'Mechanical Engineering', 'Information Technology', 'Civil Engineering'] 
      }
    });

    console.log(`Found ${invalidDeptUsers.length} users with invalid departments`);

    // Update admin users with invalid departments
    await User.updateMany(
      { 
        role: 'admin',
        department: { $nin: ['Computer Science', 'Mechanical Engineering', 'Information Technology', 'Civil Engineering'] }
      },
      { 
        $set: { department: 'Computer Science' },
        $unset: { className: 1 } // Remove className for admin users
      }
    );

    // Find users without className who are not admins
    const usersWithoutClass = await User.find({
      role: { $ne: 'admin' },
      $or: [
        { className: { $exists: false } },
        { className: null },
        { className: '' }
      ]
    });

    console.log(`Found ${usersWithoutClass.length} non-admin users without className`);

    // Update non-admin users to have default className based on department
    for (const user of usersWithoutClass) {
      let defaultClass = 'G1';
      
      // Set default className based on department
      if (user.department === 'Computer Science') {
        defaultClass = Math.random() > 0.5 ? 'G1' : (Math.random() > 0.5 ? 'G2' : 'AIML');
      } else {
        defaultClass = Math.random() > 0.5 ? 'G1' : 'G2';
      }

      // Update department if invalid
      let validDepartment = user.department;
      if (!['Computer Science', 'Mechanical Engineering', 'Information Technology', 'Civil Engineering'].includes(user.department)) {
        validDepartment = 'Computer Science'; // Default fallback
      }

      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            className: defaultClass,
            department: validDepartment
          }
        }
      );

      console.log(`Updated user ${user.email}: ${validDepartment} - ${defaultClass}`);
    }

    console.log('✅ User data migration completed successfully!');

    // Show summary
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const studentUsers = await User.countDocuments({ role: { $ne: 'admin' } });

    console.log('\n📋 Summary:');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Admin users: ${adminUsers}`);
    console.log(`Student users: ${studentUsers}`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the migration
fixExistingUsers();