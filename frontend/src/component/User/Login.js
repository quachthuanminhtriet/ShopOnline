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
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await APIs.post(endpoints['login'], {
                grant_type: 'password',
                username: username,
                password: password,
                client_id: 'BnTQGgbpuHdzDOEaAlJOIt3egH9Z5yrRGPU5AXug',
                client_secret: 'q1FGEQvL8YzSWEV45pBP2x3E5VMIiBTPFAGdSHLFwYjOOD2hM3AhneTZcrY8qEXOvJItlgOpGxR0zhKhu0gVYAUJDNlzYPGhFnqjwwgwbWfx9XnkOujyg3wAPlI5GMta',
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const { access_token } = response.data;
            localStorage.setItem('access_token', access_token); // Store access token
            navigate('/'); // Redirect to home or dashboard after successful login
        } catch (err) {
            setError("Login failed! Please check your credentials.");
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
                    <Form.Label>Username</Form.Label>
                    <div className="input-group">
                        <span className="input-group-text"><FaUser /></span>
                        <Form.Control
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                        <span className="input-group-text"><FaLock /></span>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </Form.Group>

                <div className='text-center mt-4'>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Login'}
                    </Button>

                    <Link to='/register' className='btn btn-secondary mx-2'>
                        Register
                    </Link>
                </div>
            </Form>
        </Container>
    );
};

export default Login;