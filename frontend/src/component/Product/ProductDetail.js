import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Spinner, Button, Container, Row, Col, Alert, Form, Toast } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';  // For star icons
import APIs, { endpoints } from '../../configs/APIs';
import { useNavigate } from 'react-router-dom';

const ProductDetail = ({ cart, setCart }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [toastShow, setToastShow] = useState(false);  // For success toast
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setIsLoggedIn(true);
        }

        const fetchProduct = async () => {
            try {
                const res = await APIs.get(`/products/${id}/`);
                setProduct(res.data);
                setSelectedImage(res.data.main_image);  // Set the main image on load
            } catch (error) {
                console.error("Error fetching the product:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await APIs.get(endpoints['reviews'], {
                    params: { product_id: id }
                });
                // Sort reviews by the created_at field (assuming it's available)
                const sortedReviews = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setReviews(sortedReviews);
            } catch (error) {
                console.error("Error fetching the reviews:", error);
            }
        };

        if (id) {
            fetchReviews();
        }
        fetchProduct();
    }, [id]);

    const addToCart = () => {
        if (!selectedImage) {
            alert("Please select a product image");
            return;
        }

        const existingItem = cart.find(item => item.productId === product.id && item.selectedImage === selectedImage);
        if (existingItem) {
            setCart(cart.map(item =>
                item.productId === product.id && item.selectedImage === selectedImage
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                price: product.price,
                selectedImage,
                quantity: 1
            }]);
        }

        setToastShow(true);
        setTimeout(() => setToastShow(false), 3000);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!newReview || rating === 0) {
            alert("Please provide a review and a rating");
            return;
        }

        if (!isLoggedIn) {
            alert("Bạn cần đăng nhập trước khi đánh giá sản phẩm.");
            navigate("/login");
            return;
        }

        try {
            const userResponse = await APIs.get(endpoints['current-user'], {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });

            const customerId = userResponse.data.id;

            const response = await APIs.post(
                endpoints['reviews'],
                {
                    user: customerId,
                    product_id: id,
                    content: newReview,
                    rating,
                },
                {
                    headers: { Authorization: `Bearer ${'access_token'}` }
                }
            );

            if (response.status === 201) {
                setNewReview('');
                setRating(0);
                // Prepend the new review to the sorted reviews list
                setReviews(prevReviews => [response.data, ...prevReviews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                alert("Cảm ơn bạn đã đánh giá sản phẩm!");
            } else {
                alert("Đã có lỗi xảy ra, vui lòng thử lại sau.");
            }
        } catch (error) {
            console.error("Error submitting the review:", error);
            alert("Có lỗi khi gửi đánh giá.");
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (!product) {
        return (
            <Container className="text-center mt-5">
                <Alert variant="danger">Product not found!</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            {/* Toast Notification */}
            <Toast show={toastShow} onClose={() => setToastShow(false)} autohide delay={3000} className="position-fixed bottom-0 end-0 m-4">
                <Toast.Body className="text-white bg-success">Product added to cart!</Toast.Body>
            </Toast>

            <Row className="justify-content-center">
                <Col md={8}>
                    {/* Product Card */}
                    <Card className="product-card shadow-sm mb-4 border-0 rounded-lg">
                        <Row>
                            <Col md={6} className="d-flex align-items-center justify-content-center">
                                {selectedImage ? (
                                    <Card.Img
                                        variant="top"
                                        src={selectedImage}
                                        alt={product.name}
                                        className="img-fluid rounded-lg shadow-sm"
                                    />
                                ) : (
                                    <div className="text-center">No image available</div>
                                )}
                            </Col>
                            <Col md={6}>
                                <Card.Body>
                                    <Card.Title className="fw-bold mb-3" style={{ fontSize: '1.75rem', color: '#333' }}>{product.name}</Card.Title>
                                    <Card.Text className="text-success" style={{ fontSize: '1.25rem' }}>
                                        <strong>Giá:</strong> {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </Card.Text>

                                    {/* Product Image Selection */}
                                    <Card.Text className="mb-2"><strong>Chọn sản phẩm:</strong></Card.Text>
                                    <div className="mb-3">
                                        {product.images && product.images.map((image, index) => (
                                            <Button
                                                key={index}
                                                variant={selectedImage === image ? 'primary' : 'outline-primary'}
                                                onClick={() => setSelectedImage(image)} // Set selected image
                                                className="me-2 mb-2 w-25"
                                                style={{ transition: 'all 0.3s ease', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)' }}
                                            >
                                                <Card.Img
                                                    variant="top"
                                                    src={image}
                                                    alt={`${product.name} image ${index + 1}`}
                                                    className="img-fluid w-75"
                                                />
                                            </Button>
                                        ))}
                                    </div>

                                    {/* Add to Cart Button */}
                                    <Button
                                        variant="success"
                                        onClick={addToCart}
                                        className="mt-3 w-100"
                                        style={{ fontSize: '1.1rem', transition: 'all 0.3s ease', boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)' }}
                                    >
                                        Thêm vào giỏ hàng
                                    </Button>
                                </Card.Body>

                                {/* Back Button */}
                                <Link to="/" className="btn btn-danger mt-3 w-100 rounded-lg">Quay lại danh sách</Link>
                            </Col>
                        </Row>
                    </Card>

                    {/* Image Gallery */}
                    <Card className="mt-4 border-0 shadow-sm rounded-lg">
                        <Card.Body>
                            <Card.Title className="mb-3">Hình ảnh sản phẩm</Card.Title>
                            <Row>
                                {product.images && product.images.map((image, index) => (
                                    <Col md={3} key={index}>
                                        <Card.Img
                                            variant="top"
                                            src={image}
                                            alt={`${product.name} image ${index + 1}`}
                                            className="img-fluid mb-2 rounded-lg"
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Reviews Section */}
                    <Card className="mt-4 border-0 shadow-sm rounded-lg">
                        <Card.Body>
                            <Card.Title>Đánh giá sản phẩm</Card.Title>
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className="mb-4 p-3 rounded-lg border bg-light shadow-sm">
                                        <div className="d-flex align-items-center mb-3">
                                            <div>
                                                <img
                                                    src={review.user_avatar || '/default-avatar.png'}  // Fallback to default avatar 
                                                    alt={`${review.user_first_name} avatar`}
                                                    className="rounded-circle"
                                                    style={{ width: '50px', height: '50px', marginRight: '15px' }}
                                                />
                                                <span className="fw-bold mx-2">{review.user_first_name}</span>
                                                <div>
                                                    <p className='text-center'>{review.content}</p>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div>
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} color={i < review.rating ? '#FFD700' : '#ccc'} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Chưa có đánh giá nào.</p>
                            )}

                            {/* Review Form */}
                            {isLoggedIn ? (
                                <Form onSubmit={handleReviewSubmit}>
                                    <Form.Group controlId="reviewText">
                                        <Form.Label>Đánh giá của bạn</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={newReview}
                                            onChange={(e) => setNewReview(e.target.value)}
                                            placeholder="Viết đánh giá..."
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="reviewRating" className="mt-2">
                                        <Form.Label>Đánh giá (1-5)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={rating}
                                            min={1}
                                            max={5}
                                            onChange={(e) => setRating(Number(e.target.value))}
                                            placeholder="Chọn đánh giá"
                                            required
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit" className="mt-3">Gửi đánh giá</Button>
                                </Form>
                            ) : (
                                <Alert variant="warning" className="mt-3">
                                    Bạn cần <Link to="/login">đăng nhập</Link> trước khi gửi đánh giá.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductDetail;
