import { useEffect, useState } from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

const Header = () => {
    const [cate, setCate] = useState([]);


    useEffect(() => {
        const fetchCate = async () => {
            const res = await APIs.get(endpoints['categories']);
            setCate(res.data);
        };

        fetchCate();
    }, []);

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="#">QTMT-Shop</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <NavDropdown title="Danh Mục" id="basic-nav-dropdown">
                            {cate.map((c) => (
                                <NavDropdown.Item key={c.id}>
                                    {c.name}
                                </NavDropdown.Item>
                            ))}
                            <NavDropdown.Divider />
                            <NavDropdown.Item>Login</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}



export default Header;