/**
 * Mock Supabase client for testing
 */
const createMockSupabaseClient = () => {
  const mockData = {
    orders: [],
    profiles: [],
    products: [],
    payments: [],
  };

  return {
    from: jest.fn((table) => {
      const tableData = mockData[table] || [];
      
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        like: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: tableData[0] || null,
          error: null,
        }),
        maybeSingle: jest.fn().mockResolvedValue({
          data: tableData[0] || null,
          error: null,
        }),
        then: jest.fn((callback) => {
          const result = {
            data: tableData,
            error: null,
          };
          return Promise.resolve(result).then(callback);
        }),
      };
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
          },
        },
        error: null,
      }),
      admin: {
        getUserById: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user_123',
              email: 'test@example.com',
            },
          },
          error: null,
        }),
      },
    },
    rpc: jest.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
  };
};

module.exports = { createMockSupabaseClient };
