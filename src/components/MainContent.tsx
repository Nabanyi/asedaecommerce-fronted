import { ReactNode, useEffect, useState } from 'react';
import { Container, Button, Modal, Table, ListGroup } from 'react-bootstrap';
import { BASE_URL, fetchDataFromApi } from '../ApiHelper';
import { formatNumber, showCustomErrorAlert, showCustomSuccessAlert } from '../Helper';
import { ButtonLoader } from './ButtonLoading';

interface Props {
    children: ReactNode;
}

interface CartData {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    total: number;
}

interface AuthUser {
    id: string;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phone: string;
    address: string;
    token: string;
    refreshToken: string;
}

interface Address {
    id: number,
    country: string,
    region: string,
    location: string,
    address: string,
    street: string,
    landmark: string
  }

export const MainContent = ({children}:Props) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [cartItems, setCartItems] = useState<CartData[]>([]);

    useEffect(() => {
        const loadCartItems = () => {
            const cartSaved = localStorage.getItem('ads');
            if (cartSaved) {
                const parsedCartItems = JSON.parse(cartSaved) as CartData[];
                setCartItems(parsedCartItems);
            }
        };

        loadCartItems();
    }, [show]);

    const removeItem = (id: string) => {
        const updatedCartItems = cartItems.filter(item => item.id !== id);
        setCartItems(updatedCartItems);
        localStorage.setItem('ads', JSON.stringify(updatedCartItems));
    };

    const [addresses, setAddresses] = useState<Address[]>([]);
    const getAddresses = async () => {
        try {
        const response = await fetchDataFromApi("shipping/get", "GET");
        if (response.status) {
            setAddresses(response.result);
        } else {
            console.log(response.message);
        }
        } catch (error) {
            console.error(error);
        }
    };

    const [placeOrder, setPlaceOrder] = useState(false);
    const handlePlaceOrder = () => {
        setPlaceOrder(true);
    };
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAddressId(Number(e.target.value));
    };

    const [user, setUser] = useState<AuthUser | null>(null);
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData) as AuthUser);
        }

        getAddresses()
    }, []);

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const handleCheckout = async () => {
        setIsPlacingOrder(true);
        try {
            // Retrieve cart items from localStorage
            const cartSaved = localStorage.getItem('ads');
            if (!cartSaved) {
                showCustomErrorAlert('No items in the cart');
                return;
            }
    
            const cartItems = JSON.parse(cartSaved) as CartData[];
    
            // Create an array of objects containing id and quantity
            const productids = cartItems.map(item => item.id);
            const quantities = cartItems.map(item => item.quantity);
    
            // Post to orders/create
            const response = await fetchDataFromApi('orders/create-order', 'POST', { quantities: quantities, productids:productids, address: selectedAddressId });
            if (response.status) {
                showCustomSuccessAlert('Order placed successfully');
                // Clear cart after successful order
                localStorage.removeItem('ads');
                setCartItems([]);
                setShow(false);
                setPlaceOrder(false);
            } else {
                showCustomErrorAlert(response.message);
            }

            setIsPlacingOrder(false);
        } catch (error) {
            console.error(error);
            setIsPlacingOrder(false);
            showCustomErrorAlert('An error occurred while placing the order');
        }
    };

    return (
        <>
        <Container style={{marginTop: "70px"}}>
            {children}

            {cartItems.length > 0 && (
            <Button variant='primary' onClick={handleShow} className="position-fixed" style={{bottom: "20px", right: "20px"}}>
                <i className="bx bx-cart bx-tada"></i>
            </Button>
            )}
        </Container>

    <Modal
      show={show} 
      onHide={handleClose}
      size='lg'
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
        <Modal.Body className='p-4'>
            <h2 className='text-center'> Cart </h2>
            <Table className='table' striped hover>
                <thead className='th-light'>
                    <tr>
                        <th>SN</th>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <img src={`${BASE_URL}uploads/${item.image}`} className='rounded' width={40} height="auto" alt="ad"/>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        {item.name}
                                    </div>
                                </div>
                            </td>
                            <td>{item.quantity}</td>
                            <td>{formatNumber(item.price, 2)}</td>
                            <td>{formatNumber(item.total, 2)}</td>
                            <td>
                                <span 
                                    className='p-1 rounded cursor-pointer bg-danger text-white bx bx-x small' 
                                    title="Remove"
                                    onClick={() => removeItem(item.id)}>
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <th colSpan={4} className='text-end'>Total:</th>
                        <th>{formatNumber(cartItems.reduce((acc, item) => acc + item.total, 0), 2)}</th>
                        <th></th>
                    </tr>
                </tfoot>
            </Table>
            {placeOrder && (
            <div id="savedAddresses" className='mt-5 mb-4'>
                <h5 className='mb-4'><i className='bx bx-chevron-right'></i> Your shipping sddress</h5>
                {addresses.length == 0 ? (
                <p className="text-muted small">No shipping addresses added</p>
                ) : (
                <ListGroup>
                    {addresses.map((address, index) => (
                    <ListGroup.Item className='d-flex justify-content-start' key={index}>
                        <input
                            className="form-check-input address me-1"
                            id="radio"
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={handleAddressChange}
                        />
                        <address>
                            <strong>{user?.firstName+' '+user?.lastName}</strong><br />
                            {address.location}<br />
                            {address.address}<br />
                            {address.street}<br />
                            {address.region}, {address.country}<br />
                            {address.landmark}
                        </address>
                    </ListGroup.Item>
                    ))}
                </ListGroup>
                )}
            </div>
            )}

            {placeOrder ? (
            <div className='text-center'>
                <Button variant='primary me-3' onClick={handleCheckout} disabled={isPlacingOrder}>
                    {isPlacingOrder ? <ButtonLoader/> : 'Checkout & Place Order'}
                </Button>
                <Button variant='secondary' onClick={handleClose}>Close & Continue Shopping</Button>
            </div>
            ) : (
            <div className='text-center'>
                <Button variant='primary me-3' onClick={handlePlaceOrder}>Continue to checkout</Button>
                <Button variant='secondary' onClick={handleClose}>Close</Button>
            </div>
            )}
        </Modal.Body>
    </Modal>
    </>
  );
};