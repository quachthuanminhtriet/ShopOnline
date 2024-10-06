import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa'; // Optional: For icons

import APIs, { endpoints } from '../../configs/APIs';

const Login = () => {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

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
                client_id: 'gU98nHMglqfJcMYp6DTD7jod0wtkeY5chLDFKDMe',
                client_secret: 'hJZlB3HSVBG8tw84OZYApGEBvwCjbt8QqgQoRAPIVqoboL4gyIjKca4ocv1RqqAsSkgCPYQoIrP19cHkmv7wwbKVYQn39Dbk0T15k7Oqb3AujcobCCWD30pYwAGshqPi',
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const { access_token } = response.data;
            localStorage.setItem('access_token', access_token);
            navigate('/');
            window.location.reload();            
        } catch (err) {
            setError("Đăng nhập không thành công! Vui lòng kiểm tra lại thông tin.");
            console.error("Login error:", err.response ? err.response.data : err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="mt-5 w-50">
            <h2 className='text-center mb-4'>Đăng Nhập</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleLogin} className="shadow p-4 rounded">
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <div className="input-group">
                        <span className="input-group-text"><FaUser /></span>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                    <Form.Label>Mật khẩu</Form.Label>
                    <div className="input-group">
                        <span className="input-group-text"><FaLock /></span>
                        <Form.Control
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </Form.Group>

                <div className='text-center mt-4'>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang tải...' : 'Đăng nhập'}
                    </Button>

                    <Link to='/register' className='btn btn-secondary mx-2'>
                        Đăng ký
                    </Link>
                </div>
            </Form>
        </Container>
    );
};

export default Login;   