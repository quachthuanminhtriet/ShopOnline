import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import APIs, { endpoints } from '../../configs/APIs';

const Login = () => {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        if (!username || !password) {
            setError("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await APIs.post(endpoints['login'], {
                grant_type: 'password',
                username: username,
                password: password,
                client_id: 'sobUv4GkPxUhAFV1IYIZw3cFggWKbadIbLT7b1TO',
                client_secret: 'LA9bzXgxTBQBtW9TNzlFcYpHaoF673s50KG97bAgw1pXWeHbD17SKPFjB5QZnqtRIWRe91tD9eubx1ypqJ51nsTdrdDrdrh3mojVZtTm9WbAPqa1es99zZL9rs41fxqG',
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const { access_token } = response.data;
            localStorage.setItem('access_token', access_token);
            navigate('/');  // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
            window.location.reload();            
        } catch (err) {
            setError("Đăng nhập không thành công! Vui lòng kiểm tra lại thông tin.");
            console.error("Login error:", err.response ? err.response.data : err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <div className="login-card p-4 shadow-lg rounded bg-white">
                <h2 className='text-center mb-4 text-primary'>Đăng Nhập</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleLogin} className="mb-4">
                    <Form.Group controlId="formBasicUsername" className="mb-3">
                        <Form.Label>Tên đăng nhập</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light"><FaUser /></span>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={username}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                                className="border-secondary"
                            />
                        </div>
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword" className="mb-3">
                        <Form.Label>Mật khẩu</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-light"><FaLock /></span>
                            <Form.Control
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-secondary"
                            />
                        </div>
                    </Form.Group>

                    <div className='text-center'>
                        <Button variant="primary" type="submit" disabled={isLoading} className="w-100 mb-2">
                            {isLoading ? 'Đang tải...' : 'Đăng nhập'}
                        </Button>

                        <Link to='/register' className='btn btn-secondary w-100'>
                            Đăng ký tài khoản mới
                        </Link>
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default Login;
