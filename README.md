# 🌟 Repora - Class Representative Management System

A modern, full-stack web application for managing class activities, bookings, issues, and announcements with a beautiful dark theme and smooth animations.

![Repora Banner](https://via.placeholder.com/800x200/0f172a/00f5ff?text=Repora+-+Class+Representative+Management+System)

## ✨ Features

### 🎯 Core Modules
- **Authentication System** - JWT-based login with role-based access (Student/Admin)
- **Booking Management** - Room booking system with approval workflow
- **Issue Tracking** - Report and track issues with status updates
- **Announcements** - Create and manage institutional announcements
- **Dashboard Analytics** - Comprehensive statistics and insights

### 🎨 Design & UX
- **Dark Theme** - Modern matte black design with neon accents
- **Responsive Design** - Mobile-first approach with smooth animations
- **Framer Motion** - Beautiful page transitions and micro-interactions
- **TailwindCSS** - Utility-first styling with custom components

### 🔧 Technical Stack
- **Frontend**: React 18, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT tokens with role-based middleware
- **File Upload**: Multer with validation and storage management
- **API**: RESTful API with comprehensive error handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/repora.git
   cd repora
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   ```bash
   # Backend
   cd ../backend
   cp config.env.example .env
   
   # Edit .env with your configuration
   MONGODB_URI=mongodb://localhost:27017/repora
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```

5. **Seed the database**
   ```bash
   cd backend
   npm run seed
   ```

6. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔑 Test Credentials

After running the seed script, you can use these credentials:

### Admin Account
- **Email**: admin@repora.com
- **Password**: admin123

### Student Accounts
- **Email**: alice.johnson@student.edu
- **Password**: student123

- **Email**: bob.smith@student.edu
- **Password**: student123

## 📁 Project Structure

```
repora/
├── backend/
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication & validation
│   ├── scripts/          # Database seeding
│   └── server.js         # Express server
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── utils/        # Utility functions
│   │   └── App.js        # Main app component
│   └── public/           # Static assets
└── README.md
```

## 🛠️ API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Booking Endpoints
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/all` - Get all bookings (admin)
- `PATCH /api/bookings/:id/status` - Update booking status

### Issue Endpoints
- `POST /api/issues` - Create new issue
- `GET /api/issues/my-issues` - Get user's issues
- `GET /api/issues/all` - Get all issues (admin)
- `PATCH /api/issues/:id/status` - Update issue status

### Announcement Endpoints
- `POST /api/announcements` - Create announcement (admin)
- `GET /api/announcements` - Get announcements
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

## 🎨 Customization

### Theme Colors
The application uses a custom color palette defined in `tailwind.config.js`:

- **Dark Backgrounds**: `dark-950`, `dark-900`, `dark-800`
- **Accent Colors**: `neon-blue`, `neon-purple`, `neon-green`
- **Status Colors**: `status-pending`, `status-approved`, `status-rejected`

### Adding New Features
1. Create new routes in `backend/routes/`
2. Add corresponding models in `backend/models/`
3. Create frontend components in `frontend/src/components/`
4. Add new pages in `frontend/src/pages/`

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy!

### Backend (Render/Railway)
1. Connect your repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy!

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Update `MONGODB_URI` in your environment variables
3. Whitelist your deployment IP addresses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Framer Motion** - For smooth animations
- **TailwindCSS** - For utility-first styling
- **Lucide React** - For beautiful icons
- **React Hook Form** - For form management

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

**Made with ❤️ for educational institutions**

