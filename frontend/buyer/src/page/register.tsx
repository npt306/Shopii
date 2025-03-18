import React, { useState, useEffect } from "react";
import { Button, Form, Container, Row, Col, Card, Alert } from "react-bootstrap";
import axios from "axios";
import "../css/loginPage.css";

interface FormDataStep1 {
    username: string; // used as email
}

interface FormDataStep2 {
    // additional registration fields
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    date_of_birth: string;
    phoneNumber: string;
    sex: string;
}

const RegisterPage: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [formDataStep1, setFormDataStep1] = useState<FormDataStep1>({
        username: "",
    });
    const [formDataStep2, setFormDataStep2] = useState<FormDataStep2>({
        password: "",
        username: "",
        firstName: "",
        lastName: "",
        date_of_birth: "",
        phoneNumber: "",
        sex: "",
    });
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [pollingActive, setPollingActive] = useState<boolean>(false);

    // Handle input changes for step 1
    const handleChangeStep1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormDataStep1((prev) => ({ ...prev, [name]: value }));
    };

    // Handle input changes for step 2
    const handleChangeStep2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormDataStep2((prev) => ({ ...prev, [name]: value }));
    };

    // Step 1: When the user submits their email
    const handleStep1Submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        // Basic check
        if (!formDataStep1.username) {
            setError("Vui lòng nhập email");
            return;
        }
        // Check if email is a Gmail address
        if (!formDataStep1.username.trim().toLowerCase().endsWith("@gmail.com")) {
            setError("Vui lòng nhập một địa chỉ Gmail hợp lệ");
            return;
        }
        try {
            setLoading(true);
            // Trigger email verification via your backend
            // For example, call: await axios.post('http://localhost:3000/Users/verify-email', { email: formDataStep1.username });
            // Here we simulate the API call:
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSuccess("Email xác thực đã được gửi. Vui lòng kiểm tra email của bạn.");
            // Start polling to check if the email is verified
            setPollingActive(true);
        } catch (err) {
            setError("Không thể gửi email xác thực. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Polling: Check every few seconds if the email has been verified
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (pollingActive && step === 1) {
            interval = setInterval(async () => {
                try {
                    // Replace with your backend endpoint that checks email verification
                    const response = await axios.get<{ email_verified: boolean }>(
                        `http://localhost:3000/Users/check-email?email=${encodeURIComponent(formDataStep1.username)}`
                    );
                    if (response.data.email_verified) {
                        setSuccess("Email đã được xác thực. Chuyển sang bước tiếp theo...");
                        setPollingActive(false);
                        clearInterval(interval);
                        // Advance to step 2 after a short delay
                        setTimeout(() => {
                            setStep(2);
                            // Pre-fill the email field in step 2 if needed:
                            setFormDataStep2((prev) => ({ ...prev, username: formDataStep1.username }));
                        }, 1500);
                    }
                } catch (err) {
                    console.error("Lỗi kiểm tra email:", err);
                }
            }, 5000); // Poll every 5 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [pollingActive, formDataStep1.username, step]);

    // Step 2: Handle complete registration submission
    const handleStep2Submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        // Validate required fields in step 2
        const { password, username, firstName, lastName, date_of_birth, phoneNumber, sex } = formDataStep2;
        if (!password || !username || !firstName || !lastName || !date_of_birth || !phoneNumber || !sex) {
            setError("Vui lòng điền đầy đủ thông tin");
            setLoading(false);
            return;
        }

        try {
            // Construct the registration data; note that "buyer" is the default role in your backend.
            const registrationData = {
                email: formDataStep1.username, // email from step 1
                password,
                username,
                firstName,
                lastName,
                date_of_birth,
                phoneNumber,
                status: "active",
                sex,
            };

            // Call your registration API
            const response = await axios.post("http://localhost:3000/Users/register", registrationData);
            if (response.data.success) {
                setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để biết thêm hướng dẫn.");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <>
                        <h2 className="mb-4 text-center">Đăng ký - Bước 2: Hoàn tất đăng ký</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        <Form onSubmit={handleStep2Submit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" name="username" value={formDataStep1.username} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    placeholder="Nhập username"
                                    value={formDataStep2.username}
                                    onChange={handleChangeStep2}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder="Nhập password"
                                    value={formDataStep2.password}
                                    onChange={handleChangeStep2}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    placeholder="Nhập first name"
                                    value={formDataStep2.firstName}
                                    onChange={handleChangeStep2}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    placeholder="Nhập last name"
                                    value={formDataStep2.lastName}
                                    onChange={handleChangeStep2}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Date of Birth</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date_of_birth"
                                    value={formDataStep2.date_of_birth}
                                    onChange={handleChangeStep2}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phoneNumber"
                                    placeholder="Nhập số điện thoại"
                                    value={formDataStep2.phoneNumber}
                                    onChange={handleChangeStep2}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Sex</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="sex"
                                    placeholder="Nhập giới tính (true/false)"
                                    value={formDataStep2.sex}
                                    onChange={handleChangeStep2}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
                            </Button>
                        </Form>
                    </>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterPage;
