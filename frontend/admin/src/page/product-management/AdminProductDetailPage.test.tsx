import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminProductDetailPage } from './AdminProductDetailPage';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

const renderWithRouterForDetail = (ui: React.ReactElement, { route = '/', initialEntries = ['/'] } = {}) => {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path={route} element={ui} />
                 <Route path="/admin/products" element={<div>Mock Product List Page</div>} />
            </Routes>
        </MemoryRouter>
    );
};

describe('AdminProductDetailPage Component', () => {

    const productId = 101; 
    const route = `/admin/products/${productId}`;

    it('renders loading state and then product details on successful fetch', async () => {
        renderWithRouterForDetail(<AdminProductDetailPage />, { route: '/admin/products/:id', initialEntries: [route] });

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /chi tiết sản phẩm - #101/i })).toBeInTheDocument();
        });

        expect(screen.getByText('Product A')).toBeInTheDocument();
        expect(screen.getByText(/detailed description for product a/i)).toBeInTheDocument();
        expect(screen.getByText(/Electronics, Gadgets/i)).toBeInTheDocument();
        expect(screen.getByText(/150 \/ 500/i)).toBeInTheDocument(); 
        expect(screen.getByText(/4.5 ⭐ \(25 đánh giá\)/i)).toBeInTheDocument();

        const table = screen.getByRole('table'); 
        const row1 = within(table).getByRole('row', { name: /1 Red M/i }); 
        const row2 = within(table).getByRole('row', { name: /2 Blue L/i });

        expect(within(row1).getByRole('cell', { name: 'Red' })).toBeInTheDocument();
        expect(within(row1).getByRole('cell', { name: 'M' })).toBeInTheDocument(); 
        expect(within(row1).getByRole('cell', { name: /55,000/i })).toBeInTheDocument();
        expect(within(row1).getByRole('cell', { name: '200' })).toBeInTheDocument();

        expect(within(row2).getByRole('cell', { name: 'Blue' })).toBeInTheDocument();
        expect(within(row2).getByRole('cell', { name: 'L' })).toBeInTheDocument();
        expect(within(row2).getByRole('cell', { name: /60,000/i })).toBeInTheDocument();
        expect(within(row2).getByRole('cell', { name: '300' })).toBeInTheDocument();

        expect(screen.getByRole('link', { name: /quay lại danh sách/i })).toBeInTheDocument();
    });

    it('displays "not found" message when product fetch returns 404', async () => {
        const notFoundId = 999;
        server.use(
            http.get(`/api/product/admin/products/${notFoundId}`, () => {
                return new HttpResponse(null, { status: 404 });
            })
        );

        renderWithRouterForDetail(<AdminProductDetailPage />, { route: '/admin/products/:id', initialEntries: [`/admin/products/${notFoundId}`] });

        await waitFor(() => {
            expect(screen.getByText(/sản phẩm không tồn tại/i)).toBeInTheDocument();
        });
        expect(screen.queryByText(/đang tải.../i)).not.toBeInTheDocument();
         expect(screen.getByRole('link', { name: /quay lại danh sách/i })).toBeInTheDocument();
    });

    it('displays a generic error message when product fetch fails', async () => {
        const errorId = 500;
        server.use(
            http.get(`/api/product/admin/products/${errorId}`, () => {
                return new HttpResponse('Server Error', { status: 500 });
            })
        );

        renderWithRouterForDetail(<AdminProductDetailPage />, { route: '/admin/products/:id', initialEntries: [`/admin/products/${errorId}`] });

        await waitFor(() => {
            expect(screen.getByText(/không thể tải thông tin sản phẩm/i)).toBeInTheDocument();
        });
        expect(screen.queryByText(/đang tải.../i)).not.toBeInTheDocument();
         expect(screen.getByRole('link', { name: /quay lại danh sách/i })).toBeInTheDocument();
    });
});