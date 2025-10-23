const mongoose = require('mongoose');
// const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Global test setup
beforeAll(async () => {
  // For now, we'll use a simple mock database connection
  // Uncomment the MongoDB Memory Server lines below when you want to test with real database
  
  /*
  // Start MongoDB Memory Server for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  console.log('✅ Connected to in-memory MongoDB for testing');
  */
  
  console.log('✅ Backend testing environment ready');
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections after each test (when using real database)
  /*
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  */
});

// Global test teardown
afterAll(async () => {
  // Close database connection (when using real database)
  /*
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Stop MongoDB Memory Server
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('✅ Disconnected from test database');
  */
  
  console.log('✅ Backend testing cleanup complete');
});

// Global test timeout
jest.setTimeout(30000);

// Mock console methods if needed
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};