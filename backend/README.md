# Repora Backend API

RESTful API for the Repora Class Representative Management System built with Node.js, Express.js, and MongoDB.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Environment Setup
```bash
cp config.env.example .env
# Edit .env with your configuration
```

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Seed Database
```bash
npm run seed
```

## 📋 Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/repora

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/all` - Get all bookings (admin)
- `GET /api/bookings/:id` - Get specific booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

### Issues
- `POST /api/issues` - Create issue
- `GET /api/issues/my-issues` - Get user issues
- `GET /api/issues/all` - Get all issues (admin)
- `GET /api/issues/:id` - Get specific issue
- `PATCH /api/issues/:id/status` - Update issue status
- `DELETE /api/issues/:id` - Delete issue
- `GET /api/issues/stats/summary` - Get issue statistics

### Announcements
- `POST /api/announcements` - Create announcement (admin)
- `GET /api/announcements` - Get announcements
- `GET /api/announcements/all` - Get all announcements (admin)
- `GET /api/announcements/:id` - Get specific announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement
- `PATCH /api/announcements/:id/toggle-pin` - Toggle pin status
- `GET /api/announcements/stats/summary` - Get announcement statistics

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/student/:id` - Student dashboard data
- `GET /api/dashboard/student` - Current user dashboard
- `GET /api/dashboard/analytics` - Detailed analytics

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User
- `rollNumber` - Unique roll number
- `name` - Full name
- `email` - Email address
- `password` - Hashed password
- `role` - 'student' or 'admin'
- `department` - Department name
- `year` - Academic year
- `phone` - Phone number
- `isActive` - Account status

### Booking
- `studentId` - Reference to User
- `studentRollNumber` - Student roll number
- `studentName` - Student name
- `room` - Room identifier
- `date` - Booking date
- `startTime` - Start time
- `endTime` - End time
- `purpose` - Booking purpose
- `status` - 'pending', 'approved', 'rejected'
- `adminNotes` - Admin comments
- `processedBy` - Admin who processed
- `processedAt` - Processing timestamp

### Issue
- `studentId` - Reference to User
- `studentRollNumber` - Student roll number
- `studentName` - Student name
- `title` - Issue title
- `description` - Issue description
- `category` - Issue category
- `priority` - Issue priority
- `status` - 'open', 'in-progress', 'resolved', 'closed'
- `attachments` - File attachments
- `adminNotes` - Admin comments
- `assignedTo` - Assigned admin
- `resolvedAt` - Resolution timestamp
- `resolvedBy` - Admin who resolved

### Announcement
- `title` - Announcement title
- `content` - Announcement content
- `category` - Announcement category
- `priority` - Priority level
- `targetAudience` - Target audience
- `targetYear` - Target year (if applicable)
- `targetDepartment` - Target department (if applicable)
- `isPinned` - Pinned status
- `isActive` - Active status
- `publishDate` - Publish date
- `expiryDate` - Expiry date
- `createdBy` - Creator admin
- `attachments` - File attachments
- `views` - View count
- `viewedBy` - Users who viewed

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for password security
- **Input Validation** - express-validator for request validation
- **Rate Limiting** - Prevents API abuse
- **CORS Protection** - Configurable CORS settings
- **Helmet** - Security headers
- **File Upload Validation** - Secure file upload handling

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": ["Detailed validation errors"]
}
```

## 🔧 Development

### Adding New Routes
1. Create route file in `routes/`
2. Define middleware in `middleware/`
3. Add route to `server.js`
4. Update API documentation

### Database Changes
1. Update model in `models/`
2. Create migration if needed
3. Update seed data
4. Test thoroughly

### Testing
```bash
npm test
```

## 🚀 Deployment

### Environment Variables
Set production environment variables:
- `NODE_ENV=production`
- `MONGODB_URI` - Production MongoDB URI
- `JWT_SECRET` - Strong secret key
- `CLIENT_URL` - Frontend URL

### Build
```bash
npm run build
```

### Start
```bash
npm start
```

## 📞 Support

For API support and documentation, please refer to the main README or open an issue.






