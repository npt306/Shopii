import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AddVoucherPage } from './AddVoucher';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('AddVoucherPage Component', () => {
    const user = userEvent.setup();

    const renderComponent = () =>
        render(
            <MemoryRouter>
                <AddVoucherPage />
            </MemoryRouter>
        );

    beforeEach(() => {

        vi.clearAllMocks();

         vi.spyOn(window, 'fetch').mockClear(); 
    });

    it('renders the form with default values', () => {
        renderComponent();
        expect(screen.getByRole('heading', { name: /thêm voucher mới/i })).toBeInTheDocument();

        expect(screen.getByLabelText(/tên voucher/i)).toHaveValue('');
        expect(screen.getByLabelText(/mã voucher/i)).toHaveValue('');
        expect(screen.getByLabelText(/ngày bắt đầu/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/ngày kết thúc/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/giới hạn sử dụng mỗi khách hàng/i)).toHaveValue(1);
        expect(screen.getByLabelText(/tổng số lượt sử dụng tối đa/i)).toHaveValue(100);
        expect(screen.getByLabelText(/loại điều kiện/i)).toHaveValue('none');
        expect(screen.getByLabelText(/loại giảm giá/i)).toHaveValue('fixed_amount');
        expect(screen.getByRole('button', { name: /tạo voucher/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /hủy/i })).toBeInTheDocument();
    });

    it('allows input changes for text and number fields', async () => {
        renderComponent();
        const nameInput = screen.getByLabelText(/tên voucher/i);
        const codeInput = screen.getByLabelText(/mã voucher/i);
        const limitInput = screen.getByLabelText(/giới hạn sử dụng mỗi khách hàng/i);

        await user.type(nameInput, 'Summer Sale');
        await user.type(codeInput, 'SUMMER24');

        await user.clear(limitInput);
        await user.type(limitInput, '5');

        expect(nameInput).toHaveValue('Summer Sale');
        expect(codeInput).toHaveValue('SUMMER24'); 
        expect(limitInput).toHaveValue(5);
    });

    it('updates conditional fields based on condition type selection', async () => {
        renderComponent();
        const conditionTypeSelect = screen.getByLabelText(/loại điều kiện/i);

        expect(screen.queryByLabelText(/giá trị đơn hàng tối thiểu/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/số lượng sản phẩm tối thiểu/i)).not.toBeInTheDocument();

        await user.selectOptions(conditionTypeSelect, 'min_order');
        const minOrderInput = screen.getByLabelText(/giá trị đơn hàng tối thiểu/i);
        expect(minOrderInput).toBeInTheDocument();
        expect(screen.queryByLabelText(/số lượng sản phẩm tối thiểu/i)).not.toBeInTheDocument();
        await user.type(minOrderInput, '50000');
        expect(minOrderInput).toHaveValue(50000);

        await user.selectOptions(conditionTypeSelect, 'min_products');
        const minProductsInput = screen.getByLabelText(/số lượng sản phẩm tối thiểu/i);
        expect(screen.queryByLabelText(/giá trị đơn hàng tối thiểu/i)).not.toBeInTheDocument();
        expect(minProductsInput).toBeInTheDocument();
         await user.type(minProductsInput, '3');
         expect(minProductsInput).toHaveValue(3);

        await user.selectOptions(conditionTypeSelect, 'specific_products');
        expect(screen.getByText(/chọn sản phẩm cụ thể/i)).toBeInTheDocument();

        await user.selectOptions(conditionTypeSelect, 'none');
        expect(screen.queryByLabelText(/giá trị đơn hàng tối thiểu/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/số lượng sản phẩm tối thiểu/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/chọn sản phẩm cụ thể/i)).not.toBeInTheDocument();

    });

    it('updates discount fields based on action type selection', async () => {
        renderComponent();
        const actionTypeSelect = screen.getByLabelText(/loại giảm giá/i);

        expect(screen.getByLabelText(/số tiền giảm/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/phần trăm giảm giá/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/mức hỗ trợ vận chuyển tối đa/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/mua x sản phẩm/i)).not.toBeInTheDocument();

        await user.selectOptions(actionTypeSelect, 'percentage');
        expect(screen.queryByLabelText(/số tiền giảm/i)).not.toBeInTheDocument();
        expect(screen.getByLabelText(/phần trăm giảm giá/i)).toBeInTheDocument();

        await user.selectOptions(actionTypeSelect, 'free_shipping');
        expect(screen.queryByLabelText(/số tiền giảm/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/phần trăm giảm giá/i)).not.toBeInTheDocument();
        expect(screen.getByLabelText(/mức hỗ trợ vận chuyển tối đa/i)).toBeInTheDocument();

        await user.selectOptions(actionTypeSelect, 'buy_x_get_y');
        expect(screen.queryByLabelText(/số tiền giảm/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/phần trăm giảm giá/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/mức hỗ trợ vận chuyển tối đa/i)).not.toBeInTheDocument();
        expect(screen.getByLabelText(/mua x sản phẩm/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/tặng y sản phẩm/i)).toBeInTheDocument();

        await user.selectOptions(actionTypeSelect, 'fixed_amount');
        expect(screen.getByLabelText(/số tiền giảm/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/phần trăm giảm giá/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/mức hỗ trợ vận chuyển tối đa/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/mua x sản phẩm/i)).not.toBeInTheDocument();
    });

    it('submits the form successfully and shows success message', async () => {

        renderComponent();

        await user.type(screen.getByLabelText(/tên voucher/i), 'New Test Voucher');
        await user.type(screen.getByLabelText(/mã voucher/i), 'NEWVOUCH');

        fireEvent.change(screen.getByLabelText(/ngày bắt đầu/i), { target: { value: '2024-08-01T10:00' } });
        fireEvent.change(screen.getByLabelText(/ngày kết thúc/i), { target: { value: '2024-08-31T23:59' } });
        const discountAmountInput = screen.getByLabelText(/số tiền giảm/i);
        await user.clear(discountAmountInput);
        await user.type(discountAmountInput, '15000');

        await user.click(screen.getByRole('button', { name: /tạo voucher/i }));

        await waitFor(() => {
            expect(screen.getByText(/voucher đã được tạo thành công/i)).toBeInTheDocument();
        });

        expect(screen.getByLabelText(/tên voucher/i)).toHaveValue('');
         expect(screen.getByLabelText(/mã voucher/i)).toHaveValue('');
    });

     it('shows error message on failed submission', async () => {

        server.use( 
            http.post('/api/vouchers', () => {
                 return HttpResponse.json({ message: 'Voucher code already exists' }, { status: 400 });
            })
        );

        renderComponent();

        await user.type(screen.getByLabelText(/tên voucher/i), 'Duplicate Voucher');
        await user.type(screen.getByLabelText(/mã voucher/i), 'DUPLICATE');
        fireEvent.change(screen.getByLabelText(/ngày bắt đầu/i), { target: { value: '2024-09-01T00:00' } });
        fireEvent.change(screen.getByLabelText(/ngày kết thúc/i), { target: { value: '2024-09-30T23:59' } });
        const discountAmountInput = screen.getByLabelText(/số tiền giảm/i);
        await user.clear(discountAmountInput);
        await user.type(discountAmountInput, '5000');

        await user.click(screen.getByRole('button', { name: /tạo voucher/i }));

        await waitFor(() => {
            expect(screen.getByText(/voucher code already exists/i)).toBeInTheDocument();
        });
     });

     it('resets the form when cancel button is clicked', async () => {
        renderComponent();

        await user.type(screen.getByLabelText(/tên voucher/i), 'Temporary Name');
        await user.type(screen.getByLabelText(/mã voucher/i), 'TEMP');
        await user.selectOptions(screen.getByLabelText(/loại giảm giá/i), 'percentage');
        const percentageInput = screen.getByLabelText(/phần trăm giảm giá/i); 
        await user.clear(percentageInput);
        await user.type(percentageInput, '15');

        await user.click(screen.getByRole('button', { name: /hủy/i }));

        expect(screen.getByLabelText(/tên voucher/i)).toHaveValue('');
        expect(screen.getByLabelText(/mã voucher/i)).toHaveValue('');
        expect(screen.getByLabelText(/loại giảm giá/i)).toHaveValue('fixed_amount'); 
        expect(screen.getByLabelText(/số tiền giảm/i)).toHaveValue(0); 
        expect(screen.queryByLabelText(/phần trăm giảm giá/i)).not.toBeInTheDocument();
     });
});