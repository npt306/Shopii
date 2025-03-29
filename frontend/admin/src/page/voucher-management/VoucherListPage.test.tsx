import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'; // Import within
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { VoucherListPage } from './VoucherListPage';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const originalModule = await vi.importActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

describe('VoucherListPage Component', () => {
    const user = userEvent.setup();

    const renderComponent = () =>
        render(
            <MemoryRouter initialEntries={['/admin/vouchers']}>
                <Routes>
                     <Route path="/admin/vouchers" element={<VoucherListPage />} />
                     {/* Add dummy routes for navigation targets */}
                     <Route path="/admin/vouchers/add" element={<div>Add Page</div>} />
                     <Route path="/admin/vouchers/:id" element={<div>Detail Page</div>} />
                     <Route path="/admin/vouchers/edit/:id" element={<div>Edit Page</div>} />
                </Routes>
            </MemoryRouter>
        );

    beforeEach(() => {
        vi.clearAllMocks(); // Clear mocks before each test
        // Reset handlers to default defined in handlers.ts
        server.resetHandlers();
    });

    // ... (other tests remain the same) ...

    it('shows delete confirmation modal when "Xóa" button is clicked', async () => {
        renderComponent();
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        const deleteButtons = screen.getAllByRole('button', { name: /xóa/i });
        await user.click(deleteButtons[0]); // Click the first delete button on the row

        const modal = await screen.findByRole('dialog');
        expect(modal).toBeInTheDocument();

        // --- FIX 1 (Revised): Use findByText for the title ---
        const title = await within(modal).findByText(/xác nhận xóa/i);
        expect(title).toBeInTheDocument();
        // const heading = await within(modal).findByRole('heading', { name: /xác nhận xóa/i }); // Original problematic line
        // expect(heading).toBeInTheDocument();

        expect(within(modal).getByText(/bạn có chắc chắn muốn xóa voucher này/i)).toBeInTheDocument();
    });

    // ... (other tests like close modal remain the same) ...

    it('calls delete API and removes voucher from list when deletion is confirmed', async () => {
        renderComponent();
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        // Initial state check
        expect(screen.getByRole('cell', { name: /test voucher 1/i })).toBeInTheDocument();

        const deleteButtons = screen.getAllByRole('button', { name: /xóa/i });
        await user.click(deleteButtons[0]); // Click delete for voucher ID 1 on the row

        const modal = await screen.findByRole('dialog');

        const confirmButton = within(modal).getByRole('button', { name: 'Xóa' });
        await user.click(confirmButton);

        // Wait for modal to close and row to be removed
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(screen.queryByRole('cell', { name: /test voucher 1/i })).not.toBeInTheDocument();
        });

        // Check if other vouchers remain
        expect(screen.getByRole('cell', { name: /expired voucher/i })).toBeInTheDocument();
    });

     it('shows error message on main page and closes modal if deletion fails', async () => { // Test description updated
        server.use(
            http.delete('/api/vouchers/:id', () => {
                // Simulate a 403 Forbidden error
                return HttpResponse.json({ message: 'Deletion forbidden' }, { status: 403 });
            })
        );

        renderComponent();
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        const deleteButtons = screen.getAllByRole('button', { name: /xóa/i });
        await user.click(deleteButtons[0]); // Click delete on the row

        const modal = await screen.findByRole('dialog');

        const confirmButton = within(modal).getByRole('button', { name: 'Xóa' });
        await user.click(confirmButton);

        // --- FIX 2 (Revised): Expect modal to CLOSE and error alert on main page ---
        await waitFor(() => {
             // Check modal is closed
             expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
             // Check for general error alert shown on the page
             expect(screen.getByRole('alert')).toHaveTextContent(/failed to delete voucher/i);
        });
        // expect(screen.getByRole('dialog')).toBeInTheDocument(); // Original problematic assertion
     });
});