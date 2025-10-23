const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Booking = require('../models/Booking');
const Issue = require('../models/Issue');
const Announcement = require('../models/Announcement');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting seed data creation...');

    // Clear existing data
    await User.deleteMany({});
    await Booking.deleteMany({});
    await Issue.deleteMany({});
    await Announcement.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = new User({
      rollNumber: 'ADMIN001',
      name: 'Admin User',
      email: 'admin@psgtech.ac.in',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      phone: '9876543210',
      isApproved: true, // Admin is pre-approved
      approvedAt: new Date()
    });

    await adminUser.save();
    console.log('👑 Created admin user');

    // Create sample students
    const students = [
      {
        rollNumber: 'CS2023001',
        name: 'Alice Johnson',
        email: 'alice.johnson@psgtech.ac.in',
        password: 'student123',
        department: 'Computer Science',
        year: '2nd',
        phone: '9876543211'
      },
      {
        rollNumber: 'CS2023002',
        name: 'Bob Smith',
        email: 'bob.smith@psgtech.ac.in',
        password: 'student123',
        department: 'Computer Science',
        year: '3rd',
        phone: '9876543212'
      },
      {
        rollNumber: 'EE2023001',
        name: 'Charlie Brown',
        email: 'charlie.brown@psgtech.ac.in',
        password: 'student123',
        department: 'Electrical Engineering',
        year: '1st',
        phone: '9876543213'
      },
      {
        rollNumber: 'ME2023001',
        name: 'Diana Prince',
        email: 'diana.prince@psgtech.ac.in',
        password: 'student123',
        department: 'Mechanical Engineering',
        year: '4th',
        phone: '9876543214'
      },
      {
        rollNumber: 'CS2023003',
        name: 'Eve Wilson',
        email: 'eve.wilson@psgtech.ac.in',
        password: 'student123',
        department: 'Computer Science',
        year: '2nd',
        phone: '9876543215'
      }
    ];

    const createdStudents = [];
    for (const studentData of students) {
      const student = new User({
        ...studentData,
        isApproved: true, // Pre-approve seed students for testing
        approvedBy: adminUser._id,
        approvedAt: new Date()
      });
      await student.save();
      createdStudents.push(student);
    }
    console.log(`👨‍🎓 Created ${createdStudents.length} students`);

    // Create sample bookings
    const rooms = ['LAB101', 'LAB102', 'AUDITORIUM', 'CONFERENCE_ROOM', 'LIBRARY_HALL'];
    const purposes = [
      'Study group session',
      'Project presentation practice',
      'Club meeting',
      'Workshop preparation',
      'Team collaboration',
      'Exam preparation',
      'Research discussion'
    ];

    const sampleBookings = [];
    for (let i = 0; i < 20; i++) {
      const student = createdStudents[Math.floor(Math.random() * createdStudents.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30)); // Next 30 days
      
      const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
      const startTime = `${startHour.toString().padStart(2, '0')}:00`;
      const endHour = startHour + 1 + Math.floor(Math.random() * 3); // 1-3 hours duration
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;
      
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];
      const statuses = ['pending', 'approved', 'rejected'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const booking = new Booking({
        studentId: student._id,
        studentRollNumber: student.rollNumber,
        studentName: student.name,
        room,
        date,
        startTime,
        endTime,
        purpose,
        status,
        ...(status !== 'pending' && {
          processedBy: adminUser._id,
          processedAt: new Date(),
          adminNotes: status === 'approved' ? 'Approved for academic use' : 'Room not available at requested time'
        })
      });

      await booking.save();
      sampleBookings.push(booking);
    }
    console.log(`📅 Created ${sampleBookings.length} bookings`);

    // Create sample issues
    const issueTitles = [
      'WiFi connectivity issues in Library',
      'Broken projector in LAB101',
      'Air conditioning not working in AUDITORIUM',
      'Faulty sound system in Conference Room',
      'Leaky ceiling in Computer Lab',
      'Slow internet speed in hostel',
      'Power outage in Electrical Lab',
      'Damaged furniture in Study Hall'
    ];

    const issueDescriptions = [
      'The WiFi connection keeps dropping frequently in the library, making it difficult to access online resources.',
      'The projector in LAB101 is not displaying properly. The image appears blurry and colors are distorted.',
      'The air conditioning system in the auditorium is not functioning, making it very uncomfortable during events.',
      'The sound system in the conference room has audio feedback issues and poor microphone quality.',
      'There is a leak in the ceiling of the computer lab that needs immediate attention.',
      'The internet speed in the hostel is extremely slow, affecting online classes and assignments.',
      'Frequent power outages in the electrical lab are disrupting practical sessions.',
      'Several chairs and tables in the study hall are broken and need replacement.'
    ];

    const roomOptions = [
      { id: 'LIB001', name: 'Library', description: 'Main Library Building' },
      { id: 'LAB101', name: 'Computer Lab 1', description: 'Computer Science Lab' },
      { id: 'AUD001', name: 'Main Auditorium', description: 'Main Event Auditorium' },
      { id: 'CONF01', name: 'Conference Room', description: 'Meeting Room' },
      { id: 'LAB201', name: 'Computer Lab 2', description: 'Secondary Computer Lab' },
      { id: 'HST001', name: 'Hostel Block A', description: 'Student Hostel' },
      { id: 'LAB301', name: 'Electrical Lab', description: 'Electrical Engineering Lab' },
      { id: 'STDY01', name: 'Study Hall', description: 'Common Study Area' }
    ];

    const categories = ['infrastructure', 'academic', 'hostel', 'other'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['open', 'in-progress', 'resolved'];

    const sampleIssues = [];
    for (let i = 0; i < 15; i++) {
      const student = createdStudents[Math.floor(Math.random() * createdStudents.length)];
      const title = issueTitles[Math.floor(Math.random() * issueTitles.length)];
      const description = issueDescriptions[Math.floor(Math.random() * issueDescriptions.length)];
      const room = roomOptions[Math.floor(Math.random() * roomOptions.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const issue = new Issue({
        studentId: student._id,
        studentRollNumber: student.rollNumber,
        studentName: student.name,
        title,
        description,
        room: {
          id: room.id,
          name: room.name,
          description: room.description
        },
        affectedComponents: [{
          id: 'COMP001',
          name: 'General Equipment',
          category: 'infrastructure',
          count: 1,
          specificItems: []
        }],
        category,
        priority,
        status,
        ...(status === 'in-progress' && {
          assignedTo: adminUser._id,
          adminNotes: 'Issue is being investigated and will be resolved soon.'
        }),
        ...(status === 'resolved' && {
          assignedTo: adminUser._id,
          resolvedBy: adminUser._id,
          resolvedAt: new Date(),
          adminNotes: 'Issue has been resolved successfully.'
        })
      });

      await issue.save();
      sampleIssues.push(issue);
    }
    console.log(`🐛 Created ${sampleIssues.length} issues`);

    // Create sample announcements
    const announcementTitles = [
      'Midterm Exam Schedule Released',
      'Library Extended Hours During Finals',
      'New WiFi Network Setup Complete',
      'Career Fair Registration Open',
      'Hostel Maintenance Notice',
      'Sports Week Announcement',
      'Holiday Schedule Update',
      'Cafeteria Menu Changes'
    ];

    const announcementContents = [
      'The midterm exam schedule for all courses has been released. Please check the notice board for detailed timings and room allocations.',
      'The library will remain open until 11 PM during the final examination period to support student studies.',
      'The new high-speed WiFi network is now operational across the campus. Students can connect using their credentials.',
      'Registration for the annual career fair is now open. Interested students should register through the online portal.',
      'Scheduled maintenance work will be carried out in the hostel this weekend. Please plan accordingly.',
      'Sports week will be held next month. Students interested in participating should contact the sports committee.',
      'The holiday schedule has been updated. Please check the academic calendar for the revised dates.',
      'The cafeteria menu has been updated with new healthy options. Check out the new items available.'
    ];

    const announcementCategories = ['academic', 'general', 'events', 'important'];
    const announcementPriorities = ['low', 'medium', 'high'];

    const sampleAnnouncements = [];
    for (let i = 0; i < 12; i++) {
      const title = announcementTitles[Math.floor(Math.random() * announcementTitles.length)];
      const content = announcementContents[Math.floor(Math.random() * announcementContents.length)];
      const category = announcementCategories[Math.floor(Math.random() * announcementCategories.length)];
      const priority = announcementPriorities[Math.floor(Math.random() * announcementPriorities.length)];
      const isPinned = Math.random() > 0.7; // 30% chance of being pinned

      const announcement = new Announcement({
        title,
        content,
        category,
        priority,
        isPinned,
        createdBy: adminUser._id,
        publishDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
      });

      await announcement.save();
      sampleAnnouncements.push(announcement);
    }
    console.log(`📢 Created ${sampleAnnouncements.length} announcements`);

    console.log('✅ Seed data created successfully!');
    console.log('\n📋 Summary:');
    console.log(`👑 Admin users: 1`);
    console.log(`👨‍🎓 Students: ${createdStudents.length}`);
    console.log(`📅 Bookings: ${sampleBookings.length}`);
    console.log(`🐛 Issues: ${sampleIssues.length}`);
    console.log(`📢 Announcements: ${sampleAnnouncements.length}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@psgtech.ac.in / admin123');
    console.log('Student: alice.johnson@psgtech.ac.in / student123');
    console.log('Student: bob.smith@psgtech.ac.in / student123');

  } catch (error) {
    console.error('❌ Error creating seed data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the seed function
seedData();

