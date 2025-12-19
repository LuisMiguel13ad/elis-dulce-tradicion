const { authenticate, requireRole } = require('../../middleware/auth');
const { createMockRequest, createMockResponse, createMockNext, createMockUser } = require('../helpers/testFactories');

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    it('allows authenticated users', async () => {
      const req = createMockRequest({
        headers: {
          authorization: 'Bearer valid_token',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Mock Supabase auth
      // This would require mocking the actual auth check
      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('rejects unauthenticated requests', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects invalid tokens', async () => {
      const req = createMockRequest({
        headers: {
          authorization: 'Bearer invalid_token',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('requireRole', () => {
    it('allows users with required role', async () => {
      const req = createMockRequest({
        user: createMockUser({ role: 'owner' }),
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole(['owner', 'baker']);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('rejects users without required role', async () => {
      const req = createMockRequest({
        user: createMockUser({ role: 'customer' }),
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole(['owner', 'baker']);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('handles missing user', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole(['owner']);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
