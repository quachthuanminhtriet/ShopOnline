import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert, Spinner, Image, Card, Modal } from 'react-bootstrap';
import APIs, { endpoints } from '../../configs/APIs';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        birthday: '',
        address: '',
        email: '',
        avatar: null,
    });
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [changePasswordData, setChangePasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [loadingChangePassword, setLoadingChangePassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await APIs.get(endpoints['current-user'], {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                });
                setUser(response.data);
                setFormData({
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    birthday: response.data.customer.birthday,
                    address: response.data.customer.address,
                    email: response.data.email,
                    avatar: response.data.avatar,
                });
                setAvatarPreview(response.data.avatar);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
                setErrorMessage("Không thể lấy thông tin người dùng.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prevState => ({
            ...prevState,
            avatar: file,
        }));

        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingUpdate(true);

        const formDataToSubmit = new FormData();
        formDataToSubmit.append('first_name', formData.first_name);
        formDataToSubmit.append('last_name', formData.last_name);
        formDataToSubmit.append('birthday', formData.birthday);
        formDataToSubmit.append('address', formData.address);
        formDataToSubmit.append('email', formData.email);
        if (formData.avatar) {
            formDataToSubmit.append('avatar', formData.avatar);
        }

        try {
            await APIs.put(`${endpoints['update']}${user.id}/`, formDataToSubmit, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert("Cập nhật hồ sơ thành công!");
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ:", error);
            setErrorMessage("Không thể cập nhật hồ sơ.");
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setChangePasswordData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleChangePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoadingChangePassword(true);
        if (changePasswordData.new_password !== changePasswordData.confirm_password) {
            setErrorMessage("Mật khẩu mới và xác nhận mật khẩu không khớp.");
            setLoadingChangePassword(false);
            return;
        }
        try {
            await APIs.patch(`${endpoints['update']}${user.id}/change-password/`, changePasswordData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            alert("Đã đổi mật khẩu thành công!");
            setShowChangePasswordModal(false);
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu:", error);
            setErrorMessage("Đã có lỗi xảy ra khi đổi mật khẩu.");
        } finally {
            setLoadingChangePassword(false);
        }
    };

    if (loading) {
        return <Spinner animation="border" />;
    }

    return (
        <Container className="mt-5">
            <Card className="shadow-sm">
                <Card.Body>
                    <h2 className="text-center mb-4">Hồ Sơ</h2>
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                    <Form onSubmit={handleSubmit} className="profile-form">
                        <Form.Group controlId="formAvatar" className='text-center mb-4'>
                            <div className="avatar-container">
                                <Image
                                    src={avatarPreview || formData.avatar || '/default-avatar.png'}
                                    roundedCircle
                                    style={{ width: '150px', height: '150px' }}
                                    className="avatar-img"
                                />
                                {isEditing && (
                                    <div className="edit-icon">
                                        <Button variant="link" className="edit-avatar-btn" onClick={() => document.getElementById('avatarInput').click()}>
                                            <i className="fas fa-pencil-alt"></i> Sửa ảnh
                                        </Button>
                                        <Form.Control
                                            id="avatarInput"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </Form.Group>

                        <Form.Group controlId="formFullName" className="mb-3">
                            <Form.Label>Họ và Tên</Form.Label>
                            {isEditing ? (
                                <div className="d-flex">
                                    <Form.Control
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Họ"
                                        className="me-2"
                                    />
                                    <Form.Control
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tên"
                                    />
                                </div>
                            ) : (
                                <div>{`${formData.first_name} ${formData.last_name}`}</div>
                            )}
                        </Form.Group>

                        <Form.Group controlId="formBirthday" className="mb-3">
                            <Form.Label>Ngày sinh</Form.Label>
                            {isEditing ? (
                                <Form.Control
                                    type="date"
                                    name="birthday"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    required
                                />
                            ) : (
                                <div>{formData.birthday}</div>
                            )}
                        </Form.Group>

                        <Form.Group controlId="formAddress" className="mb-3">
                            <Form.Label>Địa chỉ</Form.Label>
                            {isEditing ? (
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            ) : (
                                <div>{formData.address}</div>
                            )}
                        </Form.Group>

                        <Form.Group controlId="formEmail" className="mb-3">
                            <Form.Label>Email</Form.Label>
                            {isEditing ? (
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            ) : (
                                <div>{formData.email}</div>
                            )}
                        </Form.Group>

                        <div className="text-center mt-4">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loadingUpdate}
                                        className="me-2"
                                    >
                                        {loadingUpdate ? <Spinner animation="border" size="sm" /> : "Cập nhật hồ sơ"}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Hủy
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={(e) => {
                                            e.preventDefault(); // Ngăn chặn hành động mặc định
                                            setIsEditing(true);
                                        }}
                                        className='me-2'
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowChangePasswordModal(true)}
                                    >
                                        Đổi mật khẩu
                                    </Button>
                                </>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Change Password Modal */}
            <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Đổi Mật Khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleChangePasswordSubmit}>
                        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                        <Form.Group controlId="formCurrentPassword">
                            <Form.Label>Mật khẩu hiện tại</Form.Label>
                            <Form.Control
                                type="password"
                                name="current_password"
                                value={changePasswordData.current_password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formNewPassword" className="mt-3">
                            <Form.Label>Mật khẩu mới</Form.Label>
                            <Form.Control
                                type="password"
                                name="new_password"
                                value={changePasswordData.new_password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formConfirmPassword" className="mt-3">
                            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirm_password"
                                value={changePasswordData.confirm_password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </Form.Group>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)}>
                                Hủy
                            </Button>
                            <Button variant="primary" type="submit" disabled={loadingChangePassword}>
                                {loadingChangePassword ? <Spinner animation="border" size="sm" /> : "Đổi mật khẩu"}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Profile;
