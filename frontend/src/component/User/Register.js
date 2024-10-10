import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaPhone, FaBirthdayCake, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
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
        email: '',
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
            <div className="register-card p-4 shadow-lg rounded border-light bg-white">
                <h2 className='text-center mb-4 text-primary'>Đăng Ký Tài Khoản</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleRegister}>
                    <Form.Group controlId="formBasicUsername" className="mb-3">
                        <Form.Label className="fw-bold">Tên Đăng Nhập</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light"><FaUser /></span>
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder="Nhập tên đăng nhập"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="border-secondary"
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword" className="mb-3">
                        <Form.Label className="fw-bold">Mật Khẩu</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light"><FaLock /></span>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="border-secondary"
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicFirstName" className="mb-3">
                        <Form.Label className="fw-bold">Họ</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light"><FaUser /></span>
                            <Form.Control
                                type="text"
                                name="first_name"
                                placeholder="Họ và tên lót"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                className="border-secondary"
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicLastName" className="mb-3">
                        <Form.Label className="fw-bold">Tên</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light"><FaUser /></span>
                            <Form.Control
                                type="text"
                                name="last_name"
                                placeholder="Tên"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                className="border-secondary"
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicPhone" className="mb-3">
                        <Form.Label className="fw-bold">Số Điện Thoại</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light"><FaPhone /></span>
                            <Form.Control
                                type="tel"
                                name="number_phone"
                                placeholder="Nhập số điện thoại"
                                value={formData.number_phone}
                                onChange={handleChange}
                                required
                                className="border-secondary"
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicBirthday" className="mb-3">
                        <Form.Label className="fw-bold">Ngày Sinh</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light"><FaBirthdayCake /></span>
                            <Form.Control
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleChange}
                                required
                                className="border-secondary"
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicEmail" className="mb-3">
                        <Form.Label className="fw-bold">Email</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light"><FaEnvelope /></span>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Nhập địa chỉ email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="border-secondary"
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicAddress" className="mb-3">
                        <Form.Label className="fw-bold">Địa Chỉ</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light"><FaMapMarkerAlt /></span>
                            <Form.Control
                                type="text"
                                name="address"
                                placeholder="Nhập địa chỉ"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="border-secondary"
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicAvatar" className="mb-4">
                        <Form.Label className="fw-bold">Avatar</Form.Label>
                        <Form.Control
                            type="file"
                            name="avatar"
                            onChange={handleFileChange}
                            className="border-secondary"
                        />
                    </Form.Group>

                    <div className='text-center'>
                        <Button variant="primary" type="submit" disabled={isLoading} className="w-100 mb-3">
                            {isLoading ? 'Đang tải...' : 'Đăng Ký'}
                        </Button>
                        <Link to='/login' className='btn btn-secondary w-100'>
                            Đã có tài khoản? Đăng Nhập
                        </Link>
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default Register;
