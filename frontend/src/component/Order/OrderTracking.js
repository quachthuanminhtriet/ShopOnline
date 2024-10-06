import React, { useEffect, useState } from 'react';
import { Card, Alert, Spinner, Row, Col, Button, Modal, Image, Form } from 'react-bootstrap';
import APIs, { endpoints } from '../../configs/APIs';
import { FaCheckCircle, FaClock, FaTruck, FaTimesCircle, FaUndo } from 'react-icons/fa';

const OrderTracking = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [customerId, setCustomerId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingAction, setLoadingAction] = useState({ type: null, orderId: null });
    const [paymentStatus, setPaymentStatus] = useState(''); // Trạng thái thanh toán

    useEffect(() => {
        const fetchCustomerId = async () => {
            try {
                const userResponse = await APIs.get(endpoints['current-user'], {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                });
                setCustomerId(userResponse.data.id);
            } catch (error) {
                console.error("Error fetching user info:", error);
                setErrorMessage("Unable to fetch user information.");
                setLoading(false);
            }
        };

        fetchCustomerId();
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!customerId) return;

            setLoading(true);
            try {
                const response = await APIs.get(`${endpoints['orders']}?customer_id=${customerId}`);
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setErrorMessage("Unable to fetch orders. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [customerId]);

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="badge bg-warning text-dark"><FaClock /> Chờ xác nhận</span>;
            case 'processing':
                return <span className="badge bg-info text-white"><FaTruck /> Đang xử lý</span>;
            case 'shipping':
                return <span className="badge bg-primary text-white"><FaTruck /> Đang giao hàng</span>;
            case 'delivered':
                return <span className="badge bg-success text-white"><FaCheckCircle /> Đã nhận</span>;
            case 'returned':
                return <span className="badge bg-secondary text-white"><FaUndo /> Đã hoàn trả</span>;
            case 'cancelled':
                return <span className="badge bg-danger text-white"><FaTimesCircle /> Đã hủy</span>;
            default:
                return null;
        }
    };

    const handleCancelOrder = async (orderId) => {
        setLoadingAction({ type: 'cancel', orderId });
        try {
            const response = await APIs.patch(`${endpoints['orders']}${orderId}/cancel_order/`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            if (response.status === 200) {
                setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'pending' } : order));
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            setErrorMessage("Unable to cancel order. Please try again.");
        } finally {
            setLoadingAction({ type: null, orderId: null });
        }
    };

    const handleUpdatePaymentStatus = async (orderId) => {
        setLoadingAction({ type: 'updatePayment', orderId });
        try {
            const response = await APIs.patch(`${endpoints['orders']}${orderId}/update_payment_status/`, {
                status: paymentStatus,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            if (response.status === 200) {
                setOrders(orders.map(order => order.id === orderId ? { ...order, status: paymentStatus } : order));
                setPaymentStatus(''); // Reset trạng thái
            }
        } catch (error) {
            console.error("Error updating payment status:", error);
            setErrorMessage("Unable to update payment status. Please try again.");
        } finally {
            setLoadingAction({ type: null, orderId: null });
        }
    };

    const handleShowDetail = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedOrder(null);
    };

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (errorMessage) {
        return <Alert variant="danger">{errorMessage}</Alert>;
    }

    return (
        <div className="mt-5">
            <h2 className="text-center mb-4">Đơn Hàng Của Bạn</h2>
            {orders.length > 0 ? (
                orders.map(order => (
                    <Card key={order.id} className="shadow-sm mb-3">
                        <Card.Body>
                            <Row>
                                <Col md={8}>
                                    <Card.Text>
                                        <strong>Mã Đơn Hàng:</strong> {order.id}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Tổng Giá:</strong> {order.total_price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Trạng Thái:</strong> {renderStatusBadge(order.status)}
                                    </Card.Text>
                                </Col>
                                <Col md={4} className="text-center">
                                    <Button variant="info" className="mx-2" onClick={() => handleShowDetail(order)}>Xem Thêm</Button>
                                    {order.status === 'processing' && (
                                        <Button
                                            variant="danger"
                                            onClick={() => handleCancelOrder(order.id)}
                                            disabled={loadingAction.type === 'cancel' && loadingAction.orderId === order.id}
                                        >
                                            {loadingAction.type === 'cancel' && loadingAction.orderId === order.id ? <Spinner size="sm" animation="border" /> : 'Hủy Đơn Hàng'}
                                        </Button>
                                    )}
                                    {order.status === 'delivered' && (
                                        <Button
                                            variant="warning"
                                            onClick={() => handleUpdatePaymentStatus(order.id)}
                                            disabled={loadingAction.type === 'updatePayment' && loadingAction.orderId === order.id}
                                        >
                                            {loadingAction.type === 'updatePayment' && loadingAction.orderId === order.id ? <Spinner size="sm" animation="border" /> : 'Cập Nhật Thanh Toán'}
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <Alert variant="info" className="text-center">Không tìm thấy đơn hàng.</Alert>
            )}

            {/* Modal for order details */}
            <Modal show={showDetailModal} onHide={handleCloseDetail}>
                <Modal.Header closeButton>
                    <Modal.Title>Chi Tiết Đơn Hàng #{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <div>
                            <h5>Tổng Giá: {selectedOrder.total_price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</h5>
                            <h6>Trạng Thái: {renderStatusBadge(selectedOrder.status)}</h6>
                            <h5>Sản Phẩm:</h5>
                            {selectedOrder.items.map(item => (
                                <div key={item.id}>
                                    <strong>{item.product_name}</strong>
                                    <br />
                                    Hình Ảnh: <Image src={item.selected_image} style={{ width: '50px' }} />
                                    <br />
                                    Số lượng: {item.quantity}
                                    <br />
                                    Giá: {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    <hr />
                                </div>
                            ))}
                            <Form.Group controlId="paymentStatus">
                                <Form.Label>Cập Nhật Trạng Thái Thanh Toán</Form.Label>
                                <Form.Control as="select" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                                    <option value="">Chọn trạng thái</option>
                                    <option value="paid">Đã thanh toán</option>
                                    <option value="not-paid">Chưa thanh toán</option>
                                </Form.Control>
                                <Button variant="primary" onClick={() => handleUpdatePaymentStatus(selectedOrder.id)}>Cập Nhật</Button>
                            </Form.Group>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetail}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default OrderTracking;