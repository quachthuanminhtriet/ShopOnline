import { useEffect, useState } from "react";
import APIs, { endpoints } from "../configs/APIs";
import { Button, Container, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { FaShippingFast } from "react-icons/fa";

const Header = ({ setSearchQuery, setCateId }) => {
    const [cate, setCate] = useState([]);
    const [searchInput, setSearchInput] = useState('');


    useEffect(() => {
        const fetchCate = async () => {
            const res = await APIs.get(endpoints['categories']);
            setCate(res.data);
        };

        fetchCate();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput);
        setSearchInput('');
    };

    return (
        <Navbar expand="lg" className="bg-body-tertiary" bg="dark" data-bs-theme="dark">
            <Container>
                <Navbar.Brand><Link to='/' style={{'text-decoration': 'none', 'color': 'white'}}>QTMT-Shop</Link></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav d-flex">
                    <Nav className="me-auto">
                        <NavDropdown title="Danh Mục" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={() => setCateId('')}>All</NavDropdown.Item>
                            {cate.map((c) => (
                                <NavDropdown.Item key={c.id} onClick={() => setCateId(c.id)}>
                                    {c.name}
                                </NavDropdown.Item>
                            ))}
                            <NavDropdown.Divider />
                            <NavDropdown.Item>Login</NavDropdown.Item>
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
                    <Nav.Link className="mx-auto me-0"><Link to='/status' style={{'text-decoration': 'none', 'color': 'white'}}><FaShippingFast size={24} /></Link></Nav.Link>
                    <Nav.Link className="mx-3 me-0"><Link to='/cart' style={{'text-decoration': 'none', 'color': 'white'}}><HiOutlineShoppingCart size={24} /></Link></Nav.Link>
                    <Nav.Link className="mx-3 me-0"><Link to='/login' style={{'text-decoration': 'none', 'color': 'white'}}><VscAccount size={24} /></Link></Nav.Link>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}


export default Header;