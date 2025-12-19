import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import Menu from '@/pages/Menu';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Menu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders menu items', async () => {
    server.use(
      http.get('*/api/products', () => {
        return HttpResponse.json([
          {
            id: 1,
            name_es: 'Pastel de Chocolate',
            name_en: 'Chocolate Cake',
            price: 45.99,
            category: 'cakes',
          },
        ]);
      })
    );

    render(<Menu />);

    await waitFor(() => {
      expect(screen.getByText(/chocolate cake/i)).toBeInTheDocument();
    });
  });

  it('filters products by category', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('*/api/products', () => {
        return HttpResponse.json([
          { id: 1, name_en: 'Cake', category: 'cakes' },
          { id: 2, name_en: 'Bread', category: 'bread' },
        ]);
      })
    );

    render(<Menu />);

    // Click on cakes category
    const cakesButton = screen.getByRole('button', { name: /cakes/i });
    await user.click(cakesButton);

    // Verify only cakes are shown
    await waitFor(() => {
      expect(screen.getByText(/cake/i)).toBeInTheDocument();
      expect(screen.queryByText(/bread/i)).not.toBeInTheDocument();
    });
  });

  it('searches products', async () => {
    const user = userEvent.setup();

    render(<Menu />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'chocolate');

    // Verify search results
    await waitFor(() => {
      expect(screen.getByText(/chocolate/i)).toBeInTheDocument();
    });
  });
});
