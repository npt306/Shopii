import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom';
import { EditVoucherPage } from './EditVoucher';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const originalModule = await vi.importActual('react-router-dom');
    return {
        ...originalModule,
        useParams: vi.fn(),
        useNavigate: () => mockNavigate,
    };
});

const formatDateTimeLocal = (isoString: string): string => {

    return isoString.slice(0, 16);
};

describe('EditVoucherPage Component', () => {
    const user = userEvent.setup();
    const voucherId = '1'; 

    const mockVoucherDetail = {
        id: 1,
        name: 'Test Voucher 1',
        code: 'TEST1',
        description: 'Initial Description',
        starts_at: new Date(Date.now() + 86400000).toISOString(), 
        ends_at: new Date(Date.now() + 86400000 * 8).toISOString(), 
        per_customer_limit: 1,
        total_usage_limit: 100,
        condition_type: 'min_order',
        action_type: 'fixed_amount',
        discount_amount: 10000,
        min_order_amount: 50000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),

        discount_percentage: undefined,
        min_products: undefined,
        product_ids: [],
        free_shipping_max: undefined,
        buy_x_amount: undefined,
        get_y_amount: undefined,
    };

    const renderComponent = () => {
         vi.mocked(useParams).mockReturnValue({ id: voucherId });
         return render(
            <MemoryRouter initialEntries={[`/admin/vouchers/edit/${voucherId}`]}>
                 <Routes>
                    <Route path="/admin/vouchers/edit/:id" element={<EditVoucherPage />} />
                    <Route path="/admin/vouchers/:id" element={<div>Detail Page Redirect</div>} /> {}
                    <Route path="/admin/vouchers" element={<div>List Page Redirect</div>} /> {}
                 </Routes>
            </MemoryRouter>
        );
    }

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers(); 
        vi.mocked(useParams).mockClear();
        mockNavigate.mockClear();

        server.resetHandlers();
         server.use(
             http.get(`/api/vouchers/${voucherId}`, () => {

                 return HttpResponse.json(mockVoucherDetail);
             })
         );
    });

    it('renders loading state initially', () => {
        renderComponent();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('fetches voucher data and populates the form', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /chỉnh sửa voucher \(id: 1\)/i })).toBeInTheDocument();
        });

        expect(screen.getByLabelText(/tên voucher/i)).toHaveValue(mockVoucherDetail.name);
        expect(screen.getByLabelText(/mã voucher/i)).toHaveValue(mockVoucherDetail.code);
        expect(screen.getByLabelText(/mô tả/i)).toHaveValue(mockVoucherDetail.description);

        expect(screen.getByLabelText(/ngày bắt đầu/i)).toHaveValue(formatDateTimeLocal(mockVoucherDetail.starts_at));
        expect(screen.getByLabelText(/ngày kết thúc/i)).toHaveValue(formatDateTimeLocal(mockVoucherDetail.ends_at));
        expect(screen.getByLabelText(/giới hạn sử dụng mỗi khách hàng/i)).toHaveValue(mockVoucherDetail.per_customer_limit);
        expect(screen.getByLabelText(/tổng số lượt sử dụng tối đa/i)).toHaveValue(mockVoucherDetail.total_usage_limit);
        expect(screen.getByLabelText(/loại điều kiện/i)).toHaveValue(mockVoucherDetail.condition_type);

        expect(screen.getByLabelText(/giá trị đơn hàng tối thiểu/i)).toHaveValue(mockVoucherDetail.min_order_amount ?? null);
        expect(screen.getByLabelText(/loại giảm giá/i)).toHaveValue(mockVoucherDetail.action_type);
        expect(screen.getByLabelText(/số tiền giảm/i)).toHaveValue(mockVoucherDetail.discount_amount ?? null);
    });

    it('renders error message if initial fetch fails', async () => {
        server.use(
            http.get(`/api/vouchers/${voucherId}`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );
        renderComponent();

        await waitFor(() => {

            expect(screen.getByRole('alert')).toHaveTextContent('Đã xảy ra lỗi khi tải thông tin voucher.');
        });
        expect(screen.queryByRole('form')).not.toBeInTheDocument();
         expect(screen.getByRole('button', { name: /quay lại/i })).toBeInTheDocument();
    });

    it('renders "not found" message if initial fetch returns 404', async () => {
        server.use(
            http.get(`/api/vouchers/${voucherId}`, () => {
                return new HttpResponse(null, { status: 404 });
            })
        );
        renderComponent();

        await waitFor(() => {

            expect(screen.getByRole('alert')).toHaveTextContent('Không tìm thấy thông tin voucher.');
        });
         expect(screen.queryByRole('form')).not.toBeInTheDocument();
         expect(screen.getByRole('button', { name: /quay lại/i })).toBeInTheDocument();
    });

    it('allows changing input values', async () => {
        renderComponent();
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        const nameInput = screen.getByLabelText(/tên voucher/i);
        const limitInput = screen.getByLabelText(/tổng số lượt sử dụng tối đa/i);

        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Voucher Name');
        await user.clear(limitInput);
        await user.type(limitInput, '50');

        expect(nameInput).toHaveValue('Updated Voucher Name');
        expect(limitInput).toHaveValue(50);
    });

    it('shows error message if PATCH request fails', async () => {
        renderComponent();
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        const errorMessage = 'Update failed due to validation';

        server.use(
            http.patch(`/api/vouchers/${voucherId}`, () => {
                return HttpResponse.json({ message: errorMessage }, { status: 400 });
            })
        );

        const submitButton = screen.getByRole('button', { name: /cập nhật/i });
        await user.click(submitButton);

        await waitFor(async () => {
            const errorAlert = screen.getByRole('alert');
            expect(errorAlert).toBeInTheDocument();
            expect(errorAlert).toHaveTextContent(errorMessage);

            expect(errorAlert).toHaveClass('alert-danger');
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates back when "Hủy" button is clicked', async () => {
        renderComponent();
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        const cancelButton = screen.getByRole('button', { name: /hủy/i });
        await user.click(cancelButton);

        expect(mockNavigate).toHaveBeenCalledWith(-1); 
    });
});