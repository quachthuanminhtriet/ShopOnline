import React, { useState, useEffect } from "react";
import { Card, Col, Row, Button, Carousel, Image } from "react-bootstrap";
import APIs, { endpoints } from "../../configs/APIs";
import { Link } from "react-router-dom";

const Index = ({ searchQuery, cateId }) => {
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [brandId, setBrandId] = useState('');
    const [banner, setBanner] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await APIs.get(endpoints['products'], {
                params: { q: searchQuery, cate_id: cateId, brand: brandId }
            });
            setProducts(res.data);
        };

        fetchProducts();
    }, [searchQuery, cateId, brandId]);

    useEffect(() => {
        const fetchBrands = async () => {
            const res = await APIs.get(endpoints['brands']);
            setBrands(res.data);
        };

        const fetchBanners = async () => {
            const res = await APIs.get(endpoints['banners'])
            setBanner(res.data);
        }

        fetchBanners();
        fetchBrands();
    }, []);

    const handleButtonClick = (id) => {
        setBrandId(prevId => (prevId === id ? '' : id));
    };


    const token = localStorage.getItem('access_token');
    console.log(token); 


    return (
        <div>
            <Row className="mt-3 mb-3">
                <div>
                    <Carousel data-bs-theme="dark">
                        {banner.map((ba) => (
                            <Carousel.Item key={ba.id} className="text-center">
                                <Image src={ba.image} style={{ width: '100%', height: '500px' }}/>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </div>
            </Row>
            <Row className="mt-2">                
                <Col md={1} />
                <Col md={3} className="text-center"><h3>Danh Sách Điện Thoại</h3></Col>
                <Col md={7} className="d-flex justify-content-end me-auto">
                    {brands.map((b) => (
                        <Button className="mx-1" key={b.id} onClick={() => handleButtonClick(b.id)}
                            variant={brandId === b.id ? 'success' : 'outline-success'}>
                            {b.name}
                        </Button>
                    ))}
                    <Button className="mx-1" onClick={() => setBrandId('')}
                        variant='outline-success'>
                        All
                    </Button>
                </Col>
                <Col md={1} />
            </Row>
            <Row className="mt-2">
                <Col md={1}></Col>
                <Col md={10}>
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {products.length > 0 ? (
                            products.map((p) => (
                                <Col key={p.id}>
                                    <Card className="text-center">
                                        {p.main_image && (
                                            <Card.Img variant="top" className="mt-2 w-50 mx-auto" src={p.main_image} alt={p.name} />
                                        )}
                                        <Card.Body>
                                            <Card.Title>{p.name}</Card.Title>
                                            <Card.Text>
                                                {p.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </Card.Text>
                                            <Card.Link className="mx-auto me-3" style={{ textDecoration: 'none' }}>
                                                <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>Xem Chi Tiết</Link>
                                            </Card.Link>
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
        </div>
    );
};


export default Index;   