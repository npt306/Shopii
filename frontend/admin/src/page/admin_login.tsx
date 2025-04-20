import React, { useState, useEffect, useRef } from "react";
import { Form, Container, Row, Col, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../css/loginPage.css";

import shopeeLogoFull from '../assets/shopee-logo-full.svg';
import securityShieldIcon from '../assets/security-shield.svg';
import otpEnvelopeIcon from '../assets/otp-envelope.svg';

export const AdminLoginPage = () => {
  // Dynamically import Bootstrap CSS only when AdminLoginPage is mounted
  useEffect(() => {
    const bootstrapLink = document.createElement("link");
    bootstrapLink.rel = "stylesheet";
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
    document.head.appendChild(bootstrapLink);
    document.title = "Đăng nhập";

    return () => {
      document.head.removeChild(bootstrapLink);
    };
  }, []);

  // States for email and password fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // OTP INPUT states
  const [OtpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>(new Array(6).fill(null));
  const [resent, setResent] = useState<number>(0);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to the next input if a digit is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // SEND OTP: Trigger showing OTP fields
  const handleSendOtp = () => {
    setOtpSent(true);
  }

  const handleResendOtp = () => {
    setResent(30);
    const interval = setInterval(() => {
      setResent((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      username,
      password,
      otpCode: otp.join(''),
    };

    console.log(payload);

    try {
      //const response = await fetch("http://localhost:3003/Users/login-admin", {
      const response = await fetch("http://34.58.241.34:3003/Users/login-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        window.location.href = "/admin/vouchers";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error: ", error);
      alert("An error occurred during login.");
    }
  };

  // Tooltip for OTP field
  const renderTooltip = (props: any) => (
    <Tooltip id="otp-tooltip" {...props}>
      Get the otp code using your authenticator app
    </Tooltip>
  );

  return (
    <Container fluid className="login-page vh-100 d-flex flex-column">
      {/* Header */}
      <Row className="login-title align-items-center py-3">
        <Col className="text-center" lg={3}>
          <a href="/admin" className="text-xs text-amber-900 text-decoration-none">
            <img
              src={shopeeLogoFull}
              alt="Shopee Logo"
              className="shopee-svg-icon icon-shopee-logo"
              style={{ width: '200px', height: '40px' }}
            />
          </a>
        </Col>
        <Col className="text-center">
          <h1 className=""></h1>
        </Col>
      </Row>

      {/* Body  */}
      <Row className="login-body flex-grow-1 login-image bg-orange-600">
        <Col lg={6}></Col>

        {/* Login/Register Form Section */}
        <Col lg={6} className="d-flex align-items-center justify-content-center ">
          <Card className="login-card">
            {/* Header */}
            <div className="mt-2 mb-2 font-normal">
              <div className="text-3xl text-center">Đăng nhập</div>
            </div>
            {OtpSent ? (
              <Form className="d-flex flex-column align-items-center justify-content-center min-h-50" onSubmit={handleSubmit}>
                {/* Email Field */}
                <Form.Group className="mb-3 w-100">
                  <Form.Control
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập email"
                    required
                  />
                </Form.Group>
                {/* Password Field */}
                <Form.Group className="mb-3 w-100">
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </Form.Group>
                {/* OTP Inputs */}
                <Form.Group className="mb-3 w-100">
                  <div className="flex space-x-2 justify-center mb-2">
                    <span className="text-xl font-medium">OTP</span>
                    <OverlayTrigger placement="right" overlay={renderTooltip}>
                      <span style={{ cursor: "pointer", color: "#007bff" }}>?</span>
                    </OverlayTrigger>
                  </div>
                  <div className="d-flex justify-content-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        className="otp-input w-12 h-12 ring-orange-200 rounded text-center text-xl outline-none ring-2 focus:ring-orange-400 m-1"
                      />
                    ))}
                  </div>
                </Form.Group>
                {/* <Form.Group className="mb-3">
                  Không nhận được OTP? &nbsp;
                  <a
                    onClick={resent === 0 ? handleResendOtp : undefined}
                    className={`!text-orange-600 text-decoration-none cursor-pointer ${resent !== 0 ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Gửi lại OTP {resent !== 0 && `(${resent}s)`}
                  </a>
                </Form.Group> */}
                <button className="w-full normal-button py-2 px-4 rounded-none" type="submit">
                  ĐĂNG NHẬP
                </button>
              </Form>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center text-center w-80">
                <img
                  src={securityShieldIcon}
                  alt="Security Shield"
                  className="my-4"
                  style={{ width: '80px', height: '80px' }}
                />
                <div className="text-center">
                  Để đảm bảo tính bảo mật tài khoản, vui lòng xác minh danh tính của admin. &nbsp;
                </div>
                <button className="send-otp-button" type="button" onClick={handleSendOtp}>
                  <img
                    src={otpEnvelopeIcon}
                    alt=""
                    aria-hidden="true"
                    style={{ width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle' }}
                  />
                  Xác thực bằng OTP
                </button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLoginPage;
