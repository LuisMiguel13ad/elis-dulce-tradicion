// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test_anon_key';
process.env.SUPABASE_SERVICE_KEY = 'test_service_key';
process.env.SQUARE_APPLICATION_ID = 'test_square_app_id';
process.env.SQUARE_ACCESS_TOKEN = 'test_square_token';
process.env.SQUARE_LOCATION_ID = 'test_location_id';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.API_URL = 'http://localhost:3001';

// Increase timeout for async operations
jest.setTimeout(10000);

// Suppress console logs in tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
