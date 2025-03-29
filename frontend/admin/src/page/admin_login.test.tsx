import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminLoginPage } from './admin_login';

describe('AdminLoginPage Component', () => {

  beforeEach(() => {

     vi.clearAllMocks();

  });

  it('renders initial login state with email/password fields hidden', () => {
    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /đăng nhập của admin/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /xác thực bằng otp/i })).toBeInTheDocument();

    expect(screen.queryByPlaceholderText(/nhập email/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/nhập mật khẩu/i)).not.toBeInTheDocument();

  });

  it('shows email, password, and OTP fields after clicking "Xác thực bằng OTP"', async () => {
     const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>
    );

    const otpButton = screen.getByRole('button', { name: /xác thực bằng otp/i });
    await user.click(otpButton);

    expect(screen.getByPlaceholderText(/nhập email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nhập mật khẩu/i)).toBeInTheDocument();

    expect(screen.getByText('OTP', { selector: 'span.text-xl.font-medium' })).toBeInTheDocument();

    const otpInputs = screen.getAllByRole('textbox').filter(input => input.classList.contains('otp-input'));
    expect(otpInputs.length).toBe(6);
  });

 it('allows typing into email and password fields', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: /xác thực bằng otp/i }));

    const emailInput = screen.getByPlaceholderText(/nhập email/i);
    const passwordInput = screen.getByPlaceholderText(/nhập mật khẩu/i);

    await user.type(emailInput, 'admin@test.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('admin@test.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('allows typing digits into OTP fields and moves focus', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: /xác thực bằng otp/i }));

    const otpInputs = screen.getAllByRole('textbox').filter(input => input.classList.contains('otp-input'));
    expect(otpInputs.length).toBe(6);

    await user.type(otpInputs[0], '1');
    expect(otpInputs[0]).toHaveValue('1');
    expect(otpInputs[1]).toHaveFocus();

    await user.type(otpInputs[1], '2');
    expect(otpInputs[1]).toHaveValue('2');
    expect(otpInputs[2]).toHaveFocus();
  });

    it('handles backspace in OTP fields', async () => {
        const user = userEvent.setup();
        render(
        <MemoryRouter>
            <AdminLoginPage />
        </MemoryRouter>
        );
        await user.click(screen.getByRole('button', { name: /xác thực bằng otp/i }));
        const otpInputs = screen.getAllByRole('textbox').filter(input => input.classList.contains('otp-input'));

        await user.type(otpInputs[0], '1');
        await user.type(otpInputs[1], '2'); 
        expect(otpInputs[1]).toHaveValue('2');
        expect(otpInputs[2]).toHaveFocus();

        await user.type(otpInputs[1], '{backspace}');
        expect(otpInputs[1]).toHaveValue(''); 

        await user.keyboard('{Backspace}'); 
        expect(otpInputs[0]).toHaveValue('1'); 
        expect(otpInputs[0]).toHaveFocus(); 
    });

  it('submits login form successfully and redirects', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: /xác thực bằng otp/i }));

    await user.type(screen.getByPlaceholderText(/nhập email/i), 'admin@test.com');
    await user.type(screen.getByPlaceholderText(/nhập mật khẩu/i), 'password');

    const otpInputs = screen.getAllByRole('textbox').filter(input => input.classList.contains('otp-input'));
    await user.type(otpInputs[0], '1');
    await user.type(otpInputs[1], '2');
    await user.type(otpInputs[2], '3');
    await user.type(otpInputs[3], '4');
    await user.type(otpInputs[4], '5');
    await user.type(otpInputs[5], '6');

    const loginButton = screen.getByRole('button', { name: /đăng nhập/i });
    await user.click(loginButton);

    await waitFor(() => {
       expect(window.location.href).toBe('/admin/vouchers');
    });
  });

  it('shows error message on failed login (invalid OTP)', async () => {
     const user = userEvent.setup();
     const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {}); 

    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: /xác thực bằng otp/i }));

    await user.type(screen.getByPlaceholderText(/nhập email/i), 'admin@test.com');
    await user.type(screen.getByPlaceholderText(/nhập mật khẩu/i), 'password');

    const otpInputs = screen.getAllByRole('textbox').filter(input => input.classList.contains('otp-input'));
    await user.type(otpInputs[0], '0'); 
    await user.type(otpInputs[1], '0');
    await user.type(otpInputs[2], '0');
    await user.type(otpInputs[3], '0');
    await user.type(otpInputs[4], '0');
    await user.type(otpInputs[5], '0');

    const loginButton = screen.getByRole('button', { name: /đăng nhập/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Invalid OTP'); 
    });

     alertMock.mockRestore(); 
  });

    it('shows error message on failed login (invalid credentials)', async () => {
        const user = userEvent.setup();
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

        render(
        <MemoryRouter>
            <AdminLoginPage />
        </MemoryRouter>
        );
        await user.click(screen.getByRole('button', { name: /xác thực bằng otp/i }));

        await user.type(screen.getByPlaceholderText(/nhập email/i), 'wrong@test.com');
        await user.type(screen.getByPlaceholderText(/nhập mật khẩu/i), 'wrong');
        const otpInputs = screen.getAllByRole('textbox').filter(input => input.classList.contains('otp-input'));
        await user.type(otpInputs[0], '1');
        await user.type(otpInputs[1], '2');
        await user.type(otpInputs[2], '3');
        await user.type(otpInputs[3], '4');
        await user.type(otpInputs[4], '5');
        await user.type(otpInputs[5], '6');

        const loginButton = screen.getByRole('button', { name: /đăng nhập/i });
        await user.click(loginButton);

        await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Invalid credentials');
        });

        alertMock.mockRestore();
    });
});