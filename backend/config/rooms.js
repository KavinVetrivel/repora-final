// College blocks configuration with rooms and their components
const COLLEGE_BLOCKS = {
  'A': { 
    name: 'A Block', 
    floors: [1, 2, 3, 4, 5],
    description: 'Main Academic Block'
  },
  'B': { 
    name: 'B Block', 
    floors: [1, 2, 3, 4],
    description: 'Laboratory Block'
  },
  'C': { 
    name: 'C Block', 
    floors: [1, 2, 3],
    description: 'Computer Science Block'
  },
  'D': { 
    name: 'D Block', 
    floors: [1, 2, 3, 4],
    description: 'Engineering Block'
  },
  'E': { 
    name: 'E Block', 
    floors: [1, 2],
    description: 'Administrative Block'
  }
};

// Room types and their typical components
const ROOM_TYPES = {
  'classroom': {
    name: 'Classroom',
    components: [
      { id: "projector", name: "Projector", count: 1, category: "AV Equipment" },
      { id: "whiteboard", name: "Whiteboard", count: 2, category: "Furniture" },
      { id: "fan", name: "Fan", count: 6, category: "HVAC" },
      { id: "air_conditioner", name: "Air Conditioner", count: 2, category: "HVAC" },
      { id: "lighting", name: "LED Light", count: 12, category: "Electrical" },
      { id: "desk", name: "Student Desk", count: 40, category: "Furniture" },
      { id: "chair", name: "Chair", count: 40, category: "Furniture" },
      { id: "teacher_desk", name: "Teacher Desk", count: 1, category: "Furniture" },
      { id: "power_outlet", name: "Power Outlet", count: 20, category: "Electrical" }
    ]
  },
  'computer_lab': {
    name: 'Computer Lab',
    components: [
      { id: "computer", name: "Computer", count: 40, category: "Hardware" },
      { id: "monitor", name: "Monitor", count: 40, category: "Hardware" },
      { id: "keyboard", name: "Keyboard", count: 40, category: "Hardware" },
      { id: "mouse", name: "Mouse", count: 40, category: "Hardware" },
      { id: "projector", name: "Projector", count: 1, category: "AV Equipment" },
      { id: "whiteboard", name: "Whiteboard", count: 2, category: "Furniture" },
      { id: "fan", name: "Fan", count: 8, category: "HVAC" },
      { id: "air_conditioner", name: "Air Conditioner", count: 3, category: "HVAC" },
      { id: "network_switch", name: "Network Switch", count: 4, category: "Network" },
      { id: "server", name: "Server", count: 1, category: "Hardware" },
      { id: "ups", name: "UPS", count: 2, category: "Electrical" },
      { id: "lighting", name: "LED Light", count: 16, category: "Electrical" },
      { id: "desk", name: "Computer Desk", count: 40, category: "Furniture" },
      { id: "chair", name: "Chair", count: 40, category: "Furniture" },
      { id: "power_outlet", name: "Power Outlet", count: 50, category: "Electrical" }
    ]
  },
  'ai_lab': {
    name: 'AI Research Lab',
    components: [
      { id: "computer", name: "High-end Computer", count: 25, category: "Hardware" },
      { id: "gpu_workstation", name: "GPU Workstation", count: 8, category: "Hardware" },
      { id: "monitor", name: "Monitor", count: 33, category: "Hardware" },
      { id: "projector", name: "4K Projector", count: 1, category: "AV Equipment" },
      { id: "server", name: "AI Server", count: 2, category: "Hardware" },
      { id: "network_switch", name: "Gigabit Switch", count: 3, category: "Network" },
      { id: "air_conditioner", name: "Precision AC", count: 4, category: "HVAC" },
      { id: "ups", name: "Enterprise UPS", count: 3, category: "Electrical" },
      { id: "whiteboard", name: "Smart Whiteboard", count: 2, category: "Furniture" },
      { id: "desk", name: "Workstation Desk", count: 25, category: "Furniture" },
      { id: "chair", name: "Ergonomic Chair", count: 25, category: "Furniture" },
      { id: "lighting", name: "LED Light", count: 20, category: "Electrical" }
    ]
  },
  'lecture_hall': {
    name: 'Lecture Hall',
    components: [
      { id: "projector", name: "HD Projector", count: 2, category: "AV Equipment" },
      { id: "microphone", name: "Wireless Microphone", count: 4, category: "AV Equipment" },
      { id: "speaker", name: "Speaker", count: 8, category: "AV Equipment" },
      { id: "amplifier", name: "Audio Amplifier", count: 2, category: "AV Equipment" },
      { id: "screen", name: "Projection Screen", count: 2, category: "AV Equipment" },
      { id: "podium", name: "Podium", count: 1, category: "Furniture" },
      { id: "whiteboard", name: "Whiteboard", count: 2, category: "Furniture" },
      { id: "fan", name: "Industrial Fan", count: 12, category: "HVAC" },
      { id: "air_conditioner", name: "Central AC", count: 4, category: "HVAC" },
      { id: "lighting", name: "LED Light", count: 30, category: "Electrical" },
      { id: "desk", name: "Student Desk", count: 100, category: "Furniture" },
      { id: "chair", name: "Chair", count: 100, category: "Furniture" },
      { id: "power_outlet", name: "Power Outlet", count: 40, category: "Electrical" }
    ]
  },
  'physics_lab': {
    name: 'Physics Lab',
    components: [
      { id: "experiment_table", name: "Experiment Table", count: 20, category: "Furniture" },
      { id: "microscope", name: "Microscope", count: 15, category: "Equipment" },
      { id: "oscilloscope", name: "Oscilloscope", count: 8, category: "Equipment" },
      { id: "multimeter", name: "Digital Multimeter", count: 20, category: "Equipment" },
      { id: "power_supply", name: "DC Power Supply", count: 15, category: "Equipment" },
      { id: "projector", name: "Projector", count: 1, category: "AV Equipment" },
      { id: "whiteboard", name: "Whiteboard", count: 3, category: "Furniture" },
      { id: "fume_hood", name: "Fume Hood", count: 4, category: "Safety" },
      { id: "fire_extinguisher", name: "Fire Extinguisher", count: 3, category: "Safety" },
      { id: "emergency_shower", name: "Emergency Shower", count: 2, category: "Safety" },
      { id: "gas_outlet", name: "Gas Outlet", count: 20, category: "Utilities" },
      { id: "water_outlet", name: "Water Outlet", count: 15, category: "Utilities" },
      { id: "exhaust_fan", name: "Exhaust Fan", count: 6, category: "HVAC" },
      { id: "chair", name: "Lab Stool", count: 40, category: "Furniture" },
      { id: "lighting", name: "LED Light", count: 18, category: "Electrical" }
    ]
  },
  'chemistry_lab': {
    name: 'Chemistry Lab',
    components: [
      { id: "lab_bench", name: "Lab Bench", count: 16, category: "Furniture" },
      { id: "fume_hood", name: "Chemical Fume Hood", count: 6, category: "Safety" },
      { id: "gas_burner", name: "Gas Burner", count: 20, category: "Equipment" },
      { id: "balance", name: "Analytical Balance", count: 4, category: "Equipment" },
      { id: "ph_meter", name: "pH Meter", count: 6, category: "Equipment" },
      { id: "centrifuge", name: "Centrifuge", count: 3, category: "Equipment" },
      { id: "distillation_unit", name: "Distillation Unit", count: 8, category: "Equipment" },
      { id: "safety_shower", name: "Safety Shower", count: 2, category: "Safety" },
      { id: "eye_wash_station", name: "Eye Wash Station", count: 4, category: "Safety" },
      { id: "fire_extinguisher", name: "Fire Extinguisher", count: 4, category: "Safety" },
      { id: "chemical_storage", name: "Chemical Storage Cabinet", count: 8, category: "Storage" },
      { id: "gas_outlet", name: "Gas Outlet", count: 24, category: "Utilities" },
      { id: "water_outlet", name: "Water Outlet", count: 20, category: "Utilities" },
      { id: "exhaust_fan", name: "Chemical Exhaust Fan", count: 8, category: "HVAC" },
      { id: "chair", name: "Lab Stool", count: 32, category: "Furniture" }
    ]
  }
};

// Specific room configurations (block + floor + room + type)
const SPECIFIC_ROOMS = {
  // B Block - Labs
  'B201': { type: 'ai_lab', name: 'AIR Lab' },
  'B202': { type: 'computer_lab', name: 'SCPS Lab' },
  'B203': { type: 'computer_lab', name: 'CSE Lab 1' },
  'B301': { type: 'physics_lab', name: 'Physics Lab 1' },
  'B302': { type: 'chemistry_lab', name: 'Chemistry Lab 1' },
  'B401': { type: 'computer_lab', name: 'Advanced Computing Lab' },

  // C Block - Computer Science
  'C101': { type: 'computer_lab', name: 'Programming Lab 1' },
  'C102': { type: 'computer_lab', name: 'Programming Lab 2' },
  'C201': { type: 'ai_lab', name: 'Machine Learning Lab' },
  'C301': { type: 'computer_lab', name: 'Software Engineering Lab' },

  // A Block - General Classrooms and Lecture Halls
  'A101': { type: 'lecture_hall', name: 'Main Auditorium' },
  'A201': { type: 'lecture_hall', name: 'Lecture Hall A' },
  'A301': { type: 'classroom', name: 'Classroom A301' },
  'A401': { type: 'classroom', name: 'Classroom A401' },

  // D Block - Engineering Labs
  'D101': { type: 'physics_lab', name: 'Electronics Lab' },
  'D201': { type: 'computer_lab', name: 'VLSI Lab' },
  'D301': { type: 'physics_lab', name: 'Communication Lab' }
};

// Helper functions
const getBlocks = () => {
  return Object.entries(COLLEGE_BLOCKS).map(([key, block]) => ({
    id: key,
    ...block
  }));
};

const getBlock = (blockId) => {
  return COLLEGE_BLOCKS[blockId] || null;
};

const getRoomInfo = (roomCode) => {
  const specificRoom = SPECIFIC_ROOMS[roomCode];
  if (!specificRoom) {
    // Default to classroom type if not specifically configured
    return {
      type: 'classroom',
      name: `Room ${roomCode}`,
      components: ROOM_TYPES.classroom.components
    };
  }

  return {
    ...specificRoom,
    components: ROOM_TYPES[specificRoom.type].components
  };
};

const getRoomsByBlock = (blockId) => {
  const block = getBlock(blockId);
  if (!block) return [];

  const rooms = [];
  
  // Get all configured rooms for this block
  Object.entries(SPECIFIC_ROOMS).forEach(([roomCode, roomInfo]) => {
    if (roomCode.startsWith(blockId)) {
      rooms.push({
        code: roomCode,
        name: roomInfo.name,
        type: roomInfo.type,
        floor: parseInt(roomCode.substring(1, 2)),
        components: ROOM_TYPES[roomInfo.type].components
      });
    }
  });

  return rooms;
};

const getComponentsByCategory = (roomCode) => {
  const roomInfo = getRoomInfo(roomCode);
  return roomInfo.components.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {});
};

module.exports = {
  COLLEGE_BLOCKS,
  ROOM_TYPES,
  SPECIFIC_ROOMS,
  getBlocks,
  getBlock,
  getRoomInfo,
  getRoomsByBlock,
  getComponentsByCategory
};