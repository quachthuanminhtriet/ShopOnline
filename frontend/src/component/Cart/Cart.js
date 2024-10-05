import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import APIs, { endpoints } from '../../configs/APIs';

const Cart = ({ cart, setCart }) => {
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(cart.map(item =>
            item.productId === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const checkout = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const userResponse = await APIs.get(endpoints['current-user'], {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });

            const customerId = userResponse.data.id;

            const orderResponse = await APIs.post(endpoints['orders'], {
                customer_id: customerId,
                total_price: totalPrice,
                status: 'pending'
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });

            const orderId = orderResponse.data.id; // Capture the order ID

            // Create order items for each item in the cart
            const orderItemsPromises = cart.map(item => {
                return APIs.post(endpoints['order-items'], {
                    order_id: orderId,
                    product_id: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    selected_image: item.selectedImage,
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                });
            });

            await Promise.all(orderItemsPromises);

            setCart([]);
        } catch (ex) {
            console.error("Error during checkout:", ex);
            setErrorMessage("Failed to create order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);
    }, []);


    return (
        <div className="mt-5">
            <h2 className="text-center mb-4">Your Cart</h2>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {cart.length === 0 ? (
                <Alert variant="info" className="text-center">Your cart is empty.</Alert>
            ) : (
                <Card className="shadow-sm">
                    <Card.Body>
                        <Row>
                            {cart.map(item => (
                                <Col key={item.productId} md={4} className="mb-3">
                                    <Card className="h-100 text-center">
                                        <Card.Img src={item.selectedImage} alt={item.name} className="w-50 mx-auto mt-2" />
                                        <Card.Body>
                                            <Card.Title>{item.name}</Card.Title>
                                            <Card.Text>
                                                <strong>Price:</strong> {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </Card.Text>
                                            <Card.Text>
                                                <strong>Quantity:</strong>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    min="1"
                                                    className="form-control d-inline-block w-50 mt-2"
                                                    onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                                                />
                                            </Card.Text>
                                            <Button variant="danger" onClick={() => removeFromCart(item.productId)}>Remove</Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <div className="text-center mt-4">
                            <h4 className="fw-bold">Total Price: {totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</h4>
                            <Button variant="success" size="lg" onClick={checkout} disabled={!isLoggedIn || loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : "Checkout"}
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default Cart;