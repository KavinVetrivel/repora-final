# Repora Frontend

Modern React application for the Repora Class Representative Management System with a beautiful dark theme and smooth animations.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm start
```

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

## 🎨 Design System

### Color Palette
- **Background**: Dark theme with matte black (`dark-950`, `dark-900`, `dark-800`)
- **Accents**: Neon colors (`neon-blue`, `neon-purple`, `neon-green`)
- **Status**: Semantic colors for different states

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800, 900

### Components
- **Buttons**: Primary, secondary, success, warning, danger variants
- **Cards**: Glass effect with hover animations
- **Forms**: Consistent input styling with validation
- **Badges**: Status indicators with color coding

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── common/         # Reusable components
│   ├── dashboard/      # Dashboard widgets
│   └── layout/         # Layout components
├── contexts/           # React contexts
├── pages/              # Page components
├── utils/              # Utility functions
└── App.js              # Main application
```

## 🎭 Animations

### Framer Motion
- **Page Transitions**: Smooth enter/exit animations
- **Stagger Animations**: Sequential element animations
- **Hover Effects**: Interactive micro-animations
- **Loading States**: Engaging loading animations

### Custom Animations
- **Fade In**: Element appearance
- **Slide Up/Down**: Directional transitions
- **Scale In**: Modal and popup animations
- **Glow Effects**: Neon accent highlights
- **Float**: Subtle floating animations

## 🔧 Customization

### Theme Configuration
Edit `tailwind.config.js` to customize:
- Colors and gradients
- Animation keyframes
- Component variants
- Responsive breakpoints

### Adding New Pages
1. Create component in `pages/`
2. Add route in `App.js`
3. Update navigation in `Sidebar.js`
4. Add page-specific animations

### Styling Components
Use TailwindCSS classes with custom utilities:
```jsx
<div className="card card-hover p-6">
  <h2 className="text-xl font-semibold text-dark-100">Title</h2>
  <p className="text-dark-400">Description</p>
</div>
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Mobile Features
- Collapsible sidebar
- Touch-friendly interactions
- Optimized layouts
- Responsive typography

## 🔐 Authentication

### Auth Context
- User state management
- Login/logout functionality
- Role-based access control
- Token management

### Protected Routes
- Route-level protection
- Role-based redirects
- Loading states
- Error handling

## 📊 State Management

### Context API
- **AuthContext**: User authentication state
- **ThemeContext**: Theme preferences (future)
- **NotificationContext**: Toast notifications

### API Integration
- Axios instance with interceptors
- Automatic token management
- Error handling
- Request/response logging

## 🎨 Component Library

### Common Components
- **LoadingSpinner**: Animated loading indicator
- **Button**: Various button styles
- **Input**: Form input with validation
- **Card**: Container with glass effect
- **Modal**: Overlay dialogs
- **Badge**: Status indicators

### Layout Components
- **Navbar**: Top navigation bar
- **Sidebar**: Collapsible navigation
- **Layout**: Main layout wrapper
- **ProtectedRoute**: Route protection

### Dashboard Components
- **StatCard**: Statistics display
- **ActivityFeed**: Recent activities
- **ChartWidget**: Data visualization
- **QuickActions**: Action buttons

## 🔧 Development Tools

### Code Quality
- ESLint configuration
- Prettier formatting
- TypeScript support (optional)

### Performance
- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis

## 🚀 Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Deployment Platforms
- **Vercel**: Recommended for React apps
- **Netlify**: Alternative deployment option
- **GitHub Pages**: Free hosting option

## 🧪 Testing

### Testing Setup
```bash
npm test
```

### Test Coverage
- Component unit tests
- Integration tests
- User interaction tests
- API mocking

## 📦 Dependencies

### Core Dependencies
- **React 18**: UI library
- **React Router**: Client-side routing
- **Framer Motion**: Animation library
- **TailwindCSS**: Styling framework

### Utility Libraries
- **Axios**: HTTP client
- **React Hook Form**: Form management
- **React Hot Toast**: Notifications
- **Lucide React**: Icons
- **Date-fns**: Date utilities

## 🎯 Performance Optimization

### Best Practices
- Component memoization
- Lazy loading routes
- Image optimization
- Bundle splitting
- Caching strategies

### Monitoring
- Performance metrics
- Error tracking
- User analytics
- Bundle analysis

## 📞 Support

For frontend development questions:
- Check component documentation
- Review styling guidelines
- Test responsive behavior
- Validate accessibility

---

**Built with ❤️ using modern React practices**





