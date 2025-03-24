import logo from '../assets/react.svg';
import maleAvatar from '../assets/male_avatar.png';
import { getUserSessionData } from "../Helper";
import { useContext } from 'react';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Image } from 'react-bootstrap';

interface TopBarProps{
    currentPage: string;
}

export const TopBar = ({currentPage}: TopBarProps) => {
    const user = getUserSessionData();
    const { logout } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Navbar collapseOnSelect expand="lg" className="bg-primary" fixed="top">
            <Container>
                <Navbar.Brand href="/home">
                    <img
                    src={logo}
                    width="30"
                    height="30"
                    className="d-inline-block align-top"
                    alt="Aseda Ecommerce"
                    />
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />

                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/home" className={currentPage === 'home' ? 'active' : ''}>Home</Nav.Link>
                        <Nav.Link href="/ads" className={currentPage === 'ads' ? 'active' : ''}>My Ads</Nav.Link>
                        <Nav.Link href="/orders" className={currentPage === 'orders' ? 'active' : ''}>My Orders</Nav.Link>
                        
                        {user?.role === "ADMIN" &&
                        <Nav.Link href="/brands" className={currentPage === 'brands' ? 'active' : ''}>Brands</Nav.Link>}
                        
                        {user?.role === "ADMIN" &&
                        <Nav.Link href="/categories" className={currentPage === 'categories' ? 'active' : ''}>Categories</Nav.Link>}
                        
                        <Nav.Link href="/account" className={currentPage === 'account' ? 'active' : ''}>Account</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link onClick={handleLogout} className="cursor-pointer">Sign out</Nav.Link>
                        <Nav.Item className="ms-3 d-flex align-items-center">
                            <Image
                                src={maleAvatar}
                                roundedCircle
                                width="30"
                                height="30"
                                alt="Profile"
                                className="me-2"
                            />
                            <span className="text-light">{user?.firstName}</span>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}