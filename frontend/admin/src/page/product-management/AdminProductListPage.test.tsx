import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminProductListPage } from './AdminProductListPage';
import { server } from '../../mocks/server'; 
import { http, HttpResponse } from 'msw'; 
import { handlers } from '../../mocks/handlers'; 

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin/products" element={ui} />
        <Route path="/admin/products/:id" element={<div>Mock Product Detail Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AdminProductListPage Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    server.resetHandlers(...handlers); 

  });

  it('renders initial state with loading indicator and then products', async () => {
    renderWithRouter(<AdminProductListPage />, { route: '/admin/products' });

    await waitFor(() => {

      expect(screen.getByRole('link', { name: /Product A/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Product B Pending/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /danh sách sản phẩm/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /trạng thái/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /tìm kiếm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tìm/i })).toBeInTheDocument();
  });

  it('filters products by status', async () => {

    renderWithRouter(<AdminProductListPage />, { route: '/admin/products' });

    await screen.findByRole('link', { name: /Product A/i });

    const statusSelect = screen.getByRole('combobox', { name: /trạng thái/i });
    await user.selectOptions(statusSelect, 'Pending');

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Product B Pending/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Product A/i })).not.toBeInTheDocument();
    });
  });

  it('searches products by name', async () => {

    renderWithRouter(<AdminProductListPage />, { route: '/admin/products' });
    await screen.findByRole('link', { name: /Product A/i });

    const searchInput = screen.getByRole('textbox', { name: /tìm kiếm/i });
    const searchButton = screen.getByRole('button', { name: /tìm/i });

    await user.type(searchInput, 'Pending');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Product B Pending/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Product A/i })).not.toBeInTheDocument();
    });
  });

   it('handles pagination', async () => {

     const page1Products = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Product ${i + 1}`, status: 'Approved', createdAt: '...', updatedAt: '...', minPrice: 1, maxPrice: 2 }));
     const page2Products = [{ id: 103, name: 'Product C Page 2', status: 'Approved', createdAt: '...', updatedAt: '...', minPrice: 10000, maxPrice: 20000 }];
     const totalProducts = page1Products.length + page2Products.length; 

     server.use(
       http.get('/api/product/admin/products', ({ request }) => {
         const url = new URL(request.url);
         const page = parseInt(url.searchParams.get('page') || '1', 10);
         const limit = parseInt(url.searchParams.get('limit') || '10', 10);

         if (page === 2) {
           return HttpResponse.json({ products: page2Products, total: totalProducts, page: 2, limit });
         }

         return HttpResponse.json({ products: page1Products, total: totalProducts, page: 1, limit });
       })
     );

     renderWithRouter(<AdminProductListPage />, { route: '/admin/products' });

     await screen.findByRole('link', { name: 'Product 1' });
     expect(screen.getByRole('link', { name: 'Product 10' })).toBeInTheDocument();

     const nextButton = screen.getByRole('button', { name: /next/i });
     expect(nextButton).not.toBeDisabled();
     await user.click(nextButton);

     await waitFor(() => {
       expect(screen.getByRole('link', { name: /Product C Page 2/i })).toBeInTheDocument();
     });

     expect(screen.queryByRole('link', { name: 'Product 1' })).not.toBeInTheDocument();

     const prevButton = screen.getByRole('button', { name: /prev/i });
     expect(prevButton).not.toBeDisabled();
   });

  it('handles product approval', async () => {
     renderWithRouter(<AdminProductListPage />, { route: '/admin/products' });
     await screen.findByRole('link', { name: /Product B Pending/i });

     const productRow = screen.getByRole('link', { name: /Product B Pending/i }).closest('tr');
     expect(productRow).toBeInTheDocument();

     const approveButton = within(productRow!).getByRole('button', { name: /duyệt/i });
     expect(approveButton).toBeInTheDocument();

     await user.click(approveButton);

     await waitFor(() => {

        const updatedStatusSpan = within(productRow!).getByText(/đã duyệt/i);
        expect(updatedStatusSpan).toBeInTheDocument();

        expect(within(productRow!).queryByRole('button', { name: /duyệt/i })).not.toBeInTheDocument();
     });
   });

   it('handles product blocking', async () => {
     renderWithRouter(<AdminProductListPage />, { route: '/admin/products' });
     await screen.findByRole('link', { name: /Product A/i });

     const productRow = screen.getByRole('link', { name: /Product A/i }).closest('tr');
     expect(productRow).toBeInTheDocument();

     const blockButton = within(productRow!).getByRole('button', { name: /chặn/i });
     expect(blockButton).toBeInTheDocument();

     await user.click(blockButton);

     const modalHeading = await screen.findByRole('heading', { name: /chặn sản phẩm/i });
     const modalContainer = modalHeading.closest('div[class*="fixed"]'); 
     expect(modalContainer).toBeInTheDocument(); 

     const reasonTextarea = within(modalContainer!).getByLabelText(/lý do chặn/i);
     const confirmButton = within(modalContainer!).getByRole('button', { name: /chặn/i });

     expect(confirmButton).toBeDisabled();
     await user.type(reasonTextarea, 'Test block reason');
     expect(confirmButton).not.toBeDisabled();

     await user.click(confirmButton);

     await waitFor(() => {
       expect(screen.queryByRole('heading', { name: /chặn sản phẩm/i })).not.toBeInTheDocument();
     });

     await waitFor(() => {
        const updatedStatusSpan = within(productRow!).getByText(/vi phạm/i);
        expect(updatedStatusSpan).toBeInTheDocument();
     });
   });

  it('handles product deletion', async () => {
      renderWithRouter(<AdminProductListPage />, { route: '/admin/products' });
      const productLink = await screen.findByRole('link', { name: /Product A/i });
      const productRow = productLink.closest('tr');
      expect(productRow).toBeInTheDocument();

      const deleteButton = within(productRow!).getByRole('button', { name: /xóa/i });
      expect(deleteButton).toBeInTheDocument();

      await user.click(deleteButton);

      const modalHeading = await screen.findByRole('heading', { name: /xác nhận xóa/i });
      const modalContainer = modalHeading.closest('div[class*="fixed"]');
      expect(modalContainer).toBeInTheDocument();

      const confirmButton = within(modalContainer!).getByRole('button', { name: /xóa vĩnh viễn/i });
      const reasonTextarea = within(modalContainer!).getByLabelText(/lý do xóa/i);

      await user.type(reasonTextarea, 'Test delete reason');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: /Product A/i })).not.toBeInTheDocument();
      });

      expect(screen.getByRole('link', { name: /Product B Pending/i })).toBeInTheDocument();
   });

   it('displays an error message if fetching products fails', async () => {
       server.use(
           http.get('/api/product/admin/products', () => {
               return new HttpResponse('Internal Server Error', { status: 500 });
           })
       );

       renderWithRouter(<AdminProductListPage />, { route: '/admin/products' });

       await waitFor(() => {
           expect(screen.getByText(/không thể tải danh sách sản phẩm/i)).toBeInTheDocument();
       });
   });

});