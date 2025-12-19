import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import OrderTracking from '@/pages/OrderTracking';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock useSearchParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [
      new URLSearchParams({ orderNumber: 'ORD-2024-001' }),
    ],
  };
});

describe('OrderTracking Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays order status', async () => {
    server.use(
      http.get('*/api/orders/ORD-2024-001', () => {
        return HttpResponse.json({
          id: 1,
          order_number: 'ORD-2024-001',
          status: 'confirmed',
          customer_name: 'Test Customer',
        });
      })
    );

    render(<OrderTracking />);

    await waitFor(() => {
      expect(screen.getByText(/ORD-2024-001/i)).toBeInTheDocument();
      expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
    });
  });

  it('shows status timeline', async () => {
    server.use(
      http.get('*/api/orders/ORD-2024-001', () => {
        return HttpResponse.json({
          id: 1,
          order_number: 'ORD-2024-001',
          status: 'in_progress',
          delivery_option: 'pickup',
        });
      })
    );

    render(<OrderTracking />);

    await waitFor(() => {
      expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    });
  });

  it('handles order not found', async () => {
    server.use(
      http.get('*/api/orders/ORD-2024-001', () => {
        return HttpResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      })
    );

    render(<OrderTracking />);

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });
});
