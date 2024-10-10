import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Alert, Spinner, Form } from 'react-bootstrap';
import APIs, { endpoints } from '../../configs/APIs';
import MoMoQrCode from './MoMoQrCode';

const Cart = ({ cart, setCart }) => {
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [qrLoading, setQrLoading] = useState(false);
    const [orderIdQr, setOrderIdQr] = useState(null);
    const [totalPriceQr, setTotalPriceQr] = useState(0);

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(cart.map(item =>
            item.productId === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const createOrder = async () => {
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
                status: paymentMethod === 'online' ? 'pending' : 'pending-2',
                status_payment: paymentMethod === 'online' ? 'waiting' : 'not-yet'
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            console.log("Order Response:", orderResponse);

            if (paymentMethod === 'online') {
                setOrderIdQr(orderResponse.data.id);
                setTotalPriceQr(orderResponse.data.total_price);
            }

            const orderId = orderResponse.data.id;
            console.log("Order ID:", orderId);

            const orderItemsPromises = cart.map(item => {
                console.log(`Adding item ${item.productId} to order ${orderId}`);
                return APIs.post(endpoints['order-items'], {
                    order_id: orderId,
                    product_id: item.productId,
                    quantity: item.quantity,
                    selected_image: item.selectedImage,
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                });
            });

            await Promise.all(orderItemsPromises);

            if (paymentMethod === 'online') {
                await generateQrCode(orderId);
            }

            setCart([]);
        } catch (ex) {
            console.error("Lỗi trong quá trình thanh toán:", ex);
            setErrorMessage("Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const generateQrCode = (orderId) => {
        setQrLoading(true);
        setErrorMessage('');
        try {
            const qrValue = `momo://payment?amount=${totalPrice}&orderId=${orderId}&description=Thanh toán cho đơn hàng ${orderId}`;
            setQrCodeUrl(qrValue);
            console.log("QR Code Value:", qrValue);
        } catch (error) {
            console.error("Lỗi khi tạo mã QR:", error);
            setErrorMessage("Không thể tạo mã QR. Vui lòng thử lại.");
        } finally {
            setQrLoading(false);
        }
    };

    const checkout = () => {
        if (paymentMethod === 'online') {
            createOrder();
        } else {
            createOrder();
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);
    }, []);

    return (
        <div className="mt-5">
            <h2 className="text-center mb-4">Giỏ Hàng Của Bạn</h2>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {cart.length === 0 ? (
                <Alert variant="info" className="text-center">Giỏ hàng của bạn đang trống.</Alert>
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
                                                <strong>Giá:</strong> {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </Card.Text>
                                            <Card.Text>
                                                <strong>Số Lượng:</strong>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    min="1"
                                                    className="form-control d-inline-block w-50 mt-2"
                                                    onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                                                />
                                            </Card.Text>
                                            <Button variant="danger" onClick={() => removeFromCart(item.productId)}>Xóa</Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <div className="text-center mt-4">
                            <h4 className="fw-bold">Tổng Giá: {totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</h4>
                            <Form.Group className="mt-3">
                                <Form.Label>Chọn Phương Thức Thanh Toán</Form.Label>
                                <Form.Check
                                    type="radio"
                                    label="Thanh toán khi nhận hàng"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                />
                                <Form.Check
                                    type="radio"
                                    label="Thanh toán online"
                                    name="paymentMethod"
                                    value="online"
                                    checked={paymentMethod === 'online'}
                                    onChange={() => setPaymentMethod('online')}
                                />
                            </Form.Group>
                            <Button variant="success" size="lg" onClick={checkout} disabled={!isLoggedIn || loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : "Thanh Toán"}
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            )}
            <div>
                {paymentMethod === 'online' && orderIdQr && (
                    <MoMoQrCode amount={totalPriceQr} orderIdQr={orderIdQr} />
                )}
            </div>
        </div>
    );
};

export default Cart;