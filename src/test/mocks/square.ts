import { vi } from 'vitest';

export const createMockSquarePayments = () => {
  return {
    card: vi.fn(() => ({
      attach: vi.fn().mockResolvedValue(undefined),
      tokenize: vi.fn().mockResolvedValue({
        status: 'OK',
        token: 'mock_card_token',
      }),
    })),
    googlePay: vi.fn(() => ({
      attach: vi.fn().mockResolvedValue(undefined),
    })),
    applePay: vi.fn(() => ({
      attach: vi.fn().mockResolvedValue(undefined),
    })),
  };
};

export const mockSquarePayments = createMockSquarePayments();
