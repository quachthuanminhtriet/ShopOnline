import { useEffect, useState } from "react";
import APIs, { endpoints } from "../configs/APIs";
import { Button, Container, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { FaShippingFast } from "react-icons/fa";

const Header = ({ setSearchQuery, setCateId }) => {
    const [cate, setCate] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [user, setUser] = useState(null); // User state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCate = async () => {
            const res = await APIs.get(endpoints['categories']);
            setCate(res.data);
        };

        fetchCate();
    }, []);

    const handleCategorySelect = (id) => {
        setCateId(id);
        navigate('/');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput);
        navigate('/');
        setSearchInput('');
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
        navigate('/login');
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await APIs.get(endpoints['current-user'], {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                });
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    return (
        <Navbar expand="lg" className="bg-body-tertiary" bg="dark" data-bs-theme="dark">
            <Container>
                <Navbar.Brand>
                    <Link to='/' style={{ textDecoration: 'none', color: 'white' }}>QTMT-Shop</Link>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="d-flex">
                    <Nav className="me-auto">
                        <NavDropdown title="Danh Mục" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={() => handleCategorySelect('')}>All</NavDropdown.Item>
                            {cate.map((c) => (
                                <NavDropdown.Item key={c.id} onClick={() => handleCategorySelect(c.id)}>
                                    {c.name}
                                </NavDropdown.Item>
                            ))}
                            <NavDropdown.Divider />
                            {user ? (
                                <NavDropdown.Item onClick={handleLogout}>Đăng Xuất</NavDropdown.Item>
                            ) : (
                                <NavDropdown.Item as={Link} to="/login">Đăng Nhập</NavDropdown.Item>
                            )}
                        </NavDropdown>
                    </Nav>
                    <Form className="d-flex w-25" onSubmit={handleSearchSubmit}>
                        <Form.Control
                            type="search"
                            placeholder="Tìm Kiếm..."
                            className="me-2"
                            aria-label="Search"
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <Button variant="outline-success" type="submit">Tìm</Button>
                    </Form>
                    <Nav.Link className="mx-auto me-0">
                        <Link to='/status' style={{ textDecoration: 'none', color: 'white' }}>
                            <FaShippingFast size={24} />
                        </Link>
                    </Nav.Link>
                    <Nav.Link className="mx-3 me-0">
                        <Link to='/cart' style={{ textDecoration: 'none', color: 'white' }}>
                            <HiOutlineShoppingCart size={24} />
                        </Link>
                    </Nav.Link>
                    {user ? (
                        <Nav.Link className="mx-3 me-0">
                            <Link to='/profile' style={{ textDecoration: 'none', color: 'white' }}>
                                <img src={user.avatar} alt="Avatar" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                            </Link>
                        </Nav.Link>
                    ) : (
                        <Nav.Link className="mx-3 me-0">
                            <Link to='/login' style={{ textDecoration: 'none', color: 'white' }}>
                                <VscAccount size={24} />
                            </Link>
                        </Nav.Link>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;