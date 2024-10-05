import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Spinner, Button, Container, Row, Col, Alert, Form } from 'react-bootstrap';
import APIs from '../../configs/APIs';

const ProductDetail = ({ cart, setCart }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await APIs.get(`/products/${id}/`);
                setProduct(res.data);
                setReviews(res.data.reviews || []);
            } catch (error) {
                console.error("Error fetching the product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const addToCart = () => {
        if (!selectedImage) {
            alert("Please select a product");
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

        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!newReview || rating === 0) {
            alert("Please provide a review and a rating");
            return;
        }
        const submittedReview = { text: newReview, rating };
        setReviews([...reviews, submittedReview]);
        setNewReview('');
        setRating(0);
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
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
            {showAlert && <Alert variant="success">Product added to cart!</Alert>}
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="product-card shadow-sm border-0">
                        <Row>
                            <Col md={6}>
                                {product.main_image ? (
                                    <Card.Img variant="top" src={product.main_image} alt={product.name} className="img-fluid" />
                                ) : (
                                    <div className="text-center">No image available</div>
                                )}
                            </Col>
                            <Col md={6}>
                                <Card.Body>
                                    <Card.Title className="fw-bold">{product.name}</Card.Title>
                                    <Card.Text>
                                        <strong>Giá:</strong> {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </Card.Text>
                                    <Card.Text><strong>Chọn sản phẩm:</strong></Card.Text>
                                    <div className="mb-3">
                                        {product.images && product.images.map((image, index) => (
                                            <Button
                                                key={index}
                                                variant={selectedImage === image ? 'primary' : 'outline-primary'}
                                                onClick={() => setSelectedImage(image)}
                                                className="me-2 mb-2 w-25"
                                            >
                                                <Card.Img variant="top" src={image} alt={`${product.name} image ${index + 1}`} className="img-fluid w-75" />
                                            </Button>
                                        ))}
                                    </div>
                                    <Button variant="success" onClick={addToCart} className="mt-3">Thêm vào giỏ hàng</Button>
                                </Card.Body>
                                <Link to="/" className="btn btn-danger mt-3">Quay lại danh sách</Link>
                            </Col>
                        </Row>
                    </Card>

                    {/* Image Gallery */}
                    <Card className="mt-4 border-0 shadow-sm">
                        <Card.Body>
                            <Card.Title>Hình ảnh sản phẩm</Card.Title>
                            <Row>
                                {product.images && product.images.map((image, index) => (
                                    <Col md={3} key={index}> {/* Smaller image size */}
                                        <Card.Img variant="top" src={image} alt={`${product.name} image ${index + 1}`} className="img-fluid mb-2" />
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Reviews Section */}
                    <Card className="mt-4 border-0 shadow-sm">
                        <Card.Body>
                            <Card.Title>Đánh giá sản phẩm</Card.Title>
                            {reviews.length > 0 ? (
                                reviews.map((review, index) => (
                                    <div key={index} className="mb-2">
                                        <strong>Rating: {review.rating} ★</strong>
                                        <p>{review.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p>Chưa có đánh giá nào.</p>
                            )}
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
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductDetail;