# Class-Specific Announcements Implementation (Multi-Department)

## 🎯 **Implementation Summary**

This document outlines all the changes made to implement class-specific announcements with multi-department support where admin can target specific department-class-year combinations and users register with their department and class.

## 📋 **Requirements Implemented**

✅ **Departments**: Computer Science, Mechanical Engineering, IT, Civil Engineering  
✅ **Classes**: 
   - **Computer Science**: G1, G2, AIML
   - **Other Departments**: G1, G2 only
✅ **Year**: 1st, 2nd, 3rd, 4th, 5th (existing system)  
✅ **Announcement targeting**: Admin selects specific department-class-year combinations  
✅ **Multiple class selection**: Admin can target multiple department-class-year combinations  
✅ **Permissions**: Only admins create announcements, others just view  
✅ **Class representatives**: Can only view announcements for their class, cannot create  

---

## 🔧 **Backend Changes**

### **1. User Model (`backend/models/User.js`)**
```javascript
// Updated department field with multiple options
department: {
  type: String,
  trim: true,
  required: true,
  enum: ['Computer Science', 'Mechanical Engineering', 'Information Technology', 'Civil Engineering'],
  default: 'Computer Science'
},

// Added className with department-based validation
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
}
```

### **2. Announcement Model (`backend/models/Announcement.js`)**
```javascript
// Replaced old targeting system with department-class-based targeting
targetAudience: {
  type: String,
  enum: ['all', 'students', 'specific-classes'],
  default: 'all'
},
targetClasses: [{
  year: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', '5th'],
    required: true
  },
  department: {
    type: String,
    enum: ['Computer Science', 'Mechanical Engineering', 'Information Technology', 'Civil Engineering'],
    required: true
  },
  className: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        const parent = this.parent();
        if (parent.department === 'Computer Science') {
          return ['G1', 'G2', 'AIML'].includes(value);
        } else {
          return ['G1', 'G2'].includes(value);
        }
      },
      message: 'Invalid class for the selected department'
    }
  }
}]
```

### **3. Authentication Routes (`backend/routes/auth.js`)**
```javascript
// Added className validation
body('className')
  .if(body('role').not().equals('admin'))
  .notEmpty()
  .isIn(['G1', 'G2', 'AIML'])
  .withMessage('Class name is required and must be G1, G2, or AIML')

// Updated user creation to include className
const user = new User({
  // ... other fields
  className: userRole !== 'admin' ? className : undefined,
  // ... rest of fields
});
```

### **4. Announcement Routes (`backend/routes/announcements.js`)**
```javascript
// Updated validation for new targeting system
body('targetAudience')
  .optional()
  .isIn(['all', 'students', 'specific-classes'])
  .withMessage('Invalid target audience'),
body('targetClasses')
  .optional()
  .isArray()
  .withMessage('Target classes must be an array'),

// Updated filtering logic for students and class representatives with department
if (req.user.role === 'student' || req.user.role === 'class-representative') {
  const studentQuery = {
    $or: [
      { targetAudience: 'all' },
      { targetAudience: 'students' },
      { 
        targetAudience: 'specific-classes',
        targetClasses: {
          $elemMatch: {
            year: req.user.year,
            department: req.user.department,
            className: req.user.className
          }
        }
      }
    ]
  };
  Object.assign(query, studentQuery);
}
```

---

## 🎨 **Frontend Changes**

### **1. Registration Page (`frontend/src/pages/auth/Register.js`)**
```javascript
// Department dropdown with multiple options
<select
  {...register('department', {
    required: 'Department is required'
  })}
  // ... styling
>
  <option value="">Select department</option>
  <option value="Computer Science">Computer Science</option>
  <option value="Mechanical Engineering">Mechanical Engineering</option>
  <option value="Information Technology">Information Technology</option>
  <option value="Civil Engineering">Civil Engineering</option>
</select>

// Dynamic Class dropdown based on selected department
<select
  {...register('className', {
    required: 'Class is required'
  })}
  disabled={!selectedDepartment}
  // ... styling
>
  <option value="">
    {!selectedDepartment ? 'Select department first' : 'Select your class'}
  </option>
  <option value="G1">G1</option>
  <option value="G2">G2</option>
  {selectedDepartment === 'Computer Science' && (
    <option value="AIML">AIML</option>
  )}
</select>
```

### **2. Announcements Page (`frontend/src/pages/Announcements.js`)**
```javascript
// Updated state to include new targeting fields
const [newAnnouncement, setNewAnnouncement] = useState({
  title: '',
  content: '',
  category: 'general',
  priority: 'medium',
  targetAudience: 'all',
  targetClasses: [],
  isPinned: false
});

// Added Target Audience dropdown
<select
  value={newAnnouncement.targetAudience}
  onChange={(e) => setNewAnnouncement(prev => ({ 
    ...prev, 
    targetAudience: e.target.value,
    targetClasses: e.target.value === 'specific-classes' ? prev.targetClasses : []
  }))}
>
  <option value="all">All Students</option>
  <option value="students">General Students</option>
  <option value="specific-classes">Specific Classes</option>
</select>

// Added multi-department-class selection UI
{newAnnouncement.targetAudience === 'specific-classes' && (
  <div>
    {['1st', '2nd', '3rd', '4th', '5th'].map(year => (
      <div key={year}>
        <h4>{year} Year</h4>
        {departments.map(department => (
          <div key={`${year}-${department}`}>
            <h5>{department}</h5>
            {getClassesForDepartment(department).map(className => (
              <label key={`${year}-${department}-${className}`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={handleClassSelection}
                />
                {className}
              </label>
            ))}
          </div>
        ))}
      </div>
    ))}
  </div>
)}
```

---

## 🔍 **How It Works**

### **Registration Flow:**
1. User selects role (Student or Class Representative)
2. Department is automatically set to "Computer Science"
3. User selects their year (1st, 2nd, 3rd, 4th, 5th)
4. User selects their class (G1, G2, AIML)
5. Class Representatives need admin approval

### **Announcement Creation Flow (Admin Only):**
1. Admin creates announcement with title and content
2. Admin selects target audience:
   - **All Students**: Everyone sees it
   - **General Students**: All students see it (same as above)
   - **Specific Classes**: Only selected class-year combinations see it
3. If "Specific Classes" is selected, admin can choose multiple year-class combinations
4. Examples:
   - Target only "2nd Year G1" students
   - Target "1st Year G1", "2nd Year AIML", and "3rd Year G2" students

### **Announcement Viewing:**
- **Students & Class Representatives**: See announcements targeted to "all", "students", or their specific class-year combination
- **Admins**: See all announcements
- **Non-authenticated users**: See only general announcements

---

## 🚀 **Usage Examples**

### **Example 1: Create announcement for 2nd Year CS AIML only**
```javascript
{
  title: "AIML Workshop Tomorrow",
  content: "Special AI/ML workshop for 2nd year Computer Science AIML students...",
  targetAudience: "specific-classes",
  targetClasses: [
    { year: "2nd", department: "Computer Science", className: "AIML" }
  ]
}
```

### **Example 2: Create announcement for multiple departments and classes**
```javascript
{
  title: "Engineering Fair Registration",
  content: "Registration open for all engineering departments...",
  targetAudience: "specific-classes",
  targetClasses: [
    { year: "3rd", department: "Computer Science", className: "G1" },
    { year: "3rd", department: "Computer Science", className: "G2" },
    { year: "3rd", department: "Mechanical Engineering", className: "G1" },
    { year: "3rd", department: "Civil Engineering", className: "G2" }
  ]
}
```

### **Example 3: Cross-department announcement**
```javascript
{
  title: "Placement Drive - IT Companies",
  content: "Placement opportunities for CS and IT students...",
  targetAudience: "specific-classes",
  targetClasses: [
    { year: "4th", department: "Computer Science", className: "G1" },
    { year: "4th", department: "Computer Science", className: "G2" },
    { year: "4th", department: "Computer Science", className: "AIML" },
    { year: "4th", department: "Information Technology", className: "G1" },
    { year: "4th", department: "Information Technology", className: "G2" }
  ]
}
```

---

## 🧪 **Testing Checklist**

### **Registration Testing:**
- [ ] Department shows "Computer Science" and is not editable
- [ ] Class dropdown shows G1, G2, AIML options
- [ ] Form validation requires class selection
- [ ] Students are auto-approved
- [ ] Class representatives need admin approval

### **Announcement Creation Testing:**
- [ ] Target audience dropdown works correctly
- [ ] Class selection UI appears when "Specific Classes" is selected
- [ ] Multiple class-year combinations can be selected
- [ ] Form validation requires at least one class when targeting specific classes
- [ ] Announcements are created successfully with correct targeting

### **Announcement Viewing Testing:**
- [ ] Students see only announcements for their class
- [ ] Class representatives see only announcements for their class
- [ ] Admins see all announcements
- [ ] General announcements are visible to everyone

---

## 🎯 **Key Features**

1. **Multi-Department Support**: Computer Science, Mechanical Engineering, IT, Civil Engineering
2. **Dynamic Class System**: 
   - **Computer Science**: G1, G2, AIML
   - **Other Departments**: G1, G2 only  
3. **Flexible Targeting**: Admin can target any combination of department-year-class
4. **Cross-Department Announcements**: Single announcement can target multiple departments
5. **Permission Control**: Only admins can create announcements
6. **Role-Based Viewing**: Users see only relevant announcements for their department-class
7. **Dynamic UI**: Class options change based on selected department
8. **Validation**: Department-aware validation for class selections

The implementation is complete and ready for testing! 🎉