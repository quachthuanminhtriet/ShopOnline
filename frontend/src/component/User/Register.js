// src/Register.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaPhone, FaBirthdayCake, FaMapMarkerAlt } from 'react-icons/fa';
import APIs, { endpoints } from '../../configs/APIs';

const Register = () => {
    const [formData, setFormData] = useState({
        is_active: 1,
        first_name: '',
        last_name: '',
        username: '',
        password: '',
        number_phone: '',
        birthday: '',
        address: '',
        role: 'customer',
        avatar: null,
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, avatar: e.target.files[0] });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.username || !formData.password || !formData.number_phone || !formData.birthday || !formData.address) {
            setError("Vui lòng điền tất cả các trường.");
            return;
        }

        setIsLoading(true);

        const form = new FormData();
        for (const key in formData) {
            form.append(key, formData[key]);
        }

        try {
            await APIs.post(endpoints['register'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess("Đăng ký thành công!");
            navigate('/login');
        } catch (err) {
            setError("Đăng ký thất bại! Vui lòng kiểm tra thông tin.");
            console.error("Lỗi đăng ký:", err.response ? err.response.data : err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <div className="register-card p-4 shadow rounded">
                <h2 className='text-center mb-4'>Đăng Ký Tài Khoản</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleRegister}>
                    <Form.Group controlId="formBasicUsername">
                        <Form.Label>Tên Đăng Nhập</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text"><FaUser /></span>
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder="Nhập tên đăng nhập"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword" className="mt-3">
                        <Form.Label>Mật Khẩu</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text"><FaLock /></span>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicFirstName" className="mt-3">
                        <Form.Label>Tên</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text"><FaUser /></span>
                            <Form.Control
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicLastName" className="mt-3">
                        <Form.Label>Họ</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text"><FaUser /></span>
                            <Form.Control
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicPhone" className="mt-3">
                        <Form.Label>Số Điện Thoại</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text"><FaPhone /></span>
                            <Form.Control
                                type="tel"
                                name="number_phone"
                                placeholder="Nhập số điện thoại"
                                value={formData.number_phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicBirthday" className="mt-3">
                        <Form.Label>Ngày Sinh</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text"><FaBirthdayCake /></span>
                            <Form.Control
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicAddress" className="mt-3">
                        <Form.Label>Địa Chỉ</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text"><FaMapMarkerAlt /></span>
                            <Form.Control
                                type="text"
                                name="address"
                                placeholder="Nhập địa chỉ"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicAvatar" className="mt-3">
                        <Form.Label>Avatar</Form.Label>
                        <Form.Control
                            type="file"
                            name="avatar"
                            onChange={handleFileChange}
                        />
                    </Form.Group>

                    <div className='text-center mt-4'>
                        <Button variant="primary" type="submit" disabled={isLoading} className="w-100">
                            {isLoading ? 'Đang tải...' : 'Đăng Ký'}
                        </Button>
                        <Link to='/login' className='btn btn-secondary mt-2 w-100'>
                            Đăng Nhập
                        </Link>
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default Register;    