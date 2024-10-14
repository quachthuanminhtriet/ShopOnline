import React, { useState, useEffect } from "react";
import { Card, Col, Row, Button, Carousel, Image, Pagination, Container } from "react-bootstrap";
import APIs, { endpoints } from "../../configs/APIs";
import { Link } from "react-router-dom";
import './Index.css';

const Index = ({ searchQuery, cateId }) => {
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [brandId, setBrandId] = useState('');
    const [banner, setBanner] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await APIs.get(endpoints['products'], {
                params: {
                    q: searchQuery,
                    cate_id: cateId,
                    brand: brandId,
                    page: currentPage,
                }
            });

            setProducts(res.data.results);
            const totalPages = Math.ceil(res.data.count / 9);
            setTotalPages(totalPages);
        };

        fetchProducts();
    }, [searchQuery, cateId, brandId, currentPage]);

    useEffect(() => {
        const fetchBrands = async () => {
            const res = await APIs.get(endpoints['brands']);
            setBrands(res.data);
        };

        const fetchBanners = async () => {
            const res = await APIs.get(endpoints['banners']);
            setBanner(res.data);
        };

        fetchBanners();
        fetchBrands();
    }, []);

    const handleButtonClick = (id) => {
        setBrandId(prevId => (prevId === id ? '' : id));
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <Container>
            <Row className="mt-3 mb-3">
                <div>
                    <Carousel data-bs-theme="dark">
                        {banner.map((ba) => (
                            <Carousel.Item key={ba.id} className="text-center">
                                <Image src={ba.image} style={{ width: '100%', height: '500px' }} />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </div>
            </Row>

            <Row className="mt-2">
                <Col className="text-center mb-3">
                    <h3 className="section-title">Danh Sách Điện Thoại</h3>
                </Col>
                <Col md={12} className="d-flex justify-content-center flex-wrap">
                    {brands.map((b) => (
                        <Button
                            className="mx-1 brand-filter-btn"
                            key={b.id}
                            onClick={() => handleButtonClick(b.id)}
                            variant={brandId === b.id ? 'success' : 'outline-success'}>
                            {b.name}
                        </Button>
                    ))}
                    <Button className="mx-1 brand-filter-btn" onClick={() => setBrandId('')} variant="outline-success">
                        All
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col md={1}></Col>
                <Col md={10}>
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {products.length > 0 ? (
                            products.map((p) => (
                                <Col key={p.id}>
                                    <Card className="product-card text-center">
                                        {p.main_image && (
                                            <Card.Img
                                                variant="top"
                                                className="product-image"
                                                src={p.main_image}
                                                alt={p.name}
                                            />
                                        )}
                                        <Card.Body>
                                            <Card.Title className="product-title">{p.name}</Card.Title>
                                            <Card.Text className="product-price">
                                                {p.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </Card.Text>
                                            <Link to={`/products/${p.id}`} className="btn btn-outline-primary view-details-btn">
                                                Xem Chi Tiết
                                            </Link>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col>
                                <Card>
                                    <Card.Body className="text-center">
                                        <Card.Text>No products found.</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </Col>
                <Col md={1}></Col>
            </Row>

            <Row className="mt-4">
                <Col className="d-flex justify-content-center">
                    <Pagination>
                        {[...Array(totalPages).keys()].map(pageNumber => (
                            <Pagination.Item
                                key={pageNumber + 1}
                                active={pageNumber + 1 === currentPage}
                                onClick={() => handlePageChange(pageNumber + 1)}
                            >
                                {pageNumber + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </Col>
            </Row>
        </Container>
    );
};

export default Index;
