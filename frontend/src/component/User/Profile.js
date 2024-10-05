import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import APIs, { endpoints } from '../../configs/APIs';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        full_name: '',
        birthday: '',
        address: '',
        email: '',
        avatar: null,
    });
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await APIs.get(endpoints['current-user'], {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                });
                setUser(response.data);
                setFormData({
                    address: response.data.email,
                    avatar: response.data.avatar,
                });
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setErrorMessage("Unable to fetch user profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            avatar: e.target.files[0], // Assuming the input type is file
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingUpdate(true);

        const formDataToSubmit = new FormData();
        formDataToSubmit.append('address', formData.address);
        formDataToSubmit.append('email', formData.email);
        if (formData.avatar) {
            formDataToSubmit.append('avatar', formData.avatar);
        }

        try {
            await APIs.put(`${endpoints['customers']}${user.customer.user}/`, formDataToSubmit, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert("Profile updated successfully!");
            navigate('/'); // Redirect or take appropriate action after update
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMessage("Unable to update profile.");
        } finally {
            setLoadingUpdate(false);
        }
    };

    if (loading) {
        return <Spinner animation="border" />;
    }

    return (
        <Container className="mt-5">
            <h2>Profile</h2>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formFullName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formBirthday">
                    <Form.Label>Birthday</Form.Label>
                    <Form.Control
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formAddress">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formAvatar">
                    <Form.Label>Avatar</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loadingUpdate}>
                    {loadingUpdate ? <Spinner animation="border" size="sm" /> : "Update Profile"}
                </Button>
            </Form>
        </Container>
    );
};

export default Profile;