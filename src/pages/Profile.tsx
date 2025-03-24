import { useState, useEffect } from 'react';
import { Col, ListGroup, Row, Form, Button, Modal } from 'react-bootstrap';
import { showCustomErrorAlert, showCustomSuccessAlert } from '../Helper';
import { fetchDataFromApi } from '../ApiHelper';
import { ButtonLoader } from '../components/ButtonLoading';
import Swal from 'sweetalert2';

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

export const Account = () => {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData) as AuthUser);
      }

      getAddresses()
    }, []);

    const handleProfileDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (user) {
        setUser({
          ...user,
          [e.target.name]: e.target.value
        });
      }
    };

    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
    const submitProfileForm = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (user) {
          setIsSubmittingProfile(true)

          const formData = {
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "firstname": user.firstName,
            "middlename": user.middleName,
            "lastname": user.lastName
          }
          
          try {
              const response = await fetchDataFromApi('auth/update', 'POST', formData);
              if (response.status) {
                  localStorage.setItem('user', JSON.stringify(user));
                  setIsSubmittingProfile(false);
                  showCustomSuccessAlert(response.message);
              } else {
                setIsSubmittingProfile(false);
                  showCustomErrorAlert(response.message);
              }
          } catch (error) {
            setIsSubmittingProfile(false)
          }          
        }
    };

    // update password
    const [password, setPassword] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword({
        ...password,
        [e.target.name]: e.target.value
      });
    };

    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const handleSubmitPassword = async(e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (password.newPassword !== password.confirmPassword) {
        showCustomErrorAlert('Passwords do not match!');
        return;
      }

      setIsSubmittingPassword(true)
      const newPassword = {
        "current_password": password.currentPassword,
        "new_password": password.newPassword,
        "confirm_password": password.confirmPassword,
      };

      try {
        const response = await fetchDataFromApi('auth/update-password', 'POST', newPassword);
        if (response.status) {
          setIsSubmittingPassword(false);
          showCustomSuccessAlert(response.message);
          window.location.reload();
        } else {
          setIsSubmittingPassword(false);
          showCustomErrorAlert(response.message);
        }
      } catch (error) {
        setIsSubmittingPassword(false)
      } 
    };

    // update shipping addresses
    const [address, setAddress] = useState({
      street: '',
      location: '',
      region: '',
      country: '',
      landmark: '',
      address: ''
    });

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

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAddress({
        ...address,
        [e.target.name]: e.target.value
      });
    };

    const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
    const handleSubmitAddresses = async(e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmittingAddress(true)

      try {
        const response = await fetchDataFromApi('shipping/create', 'POST', address);
        if (response.status) {
          const createdAddress: Address = response.result;
          setAddresses(prevData => [...prevData, createdAddress]);
          setIsSubmittingAddress(false);
          setAddress({
            street: '',
            location: '',
            region: '',
            country: '',
            landmark: '',
            address: ''
          });
          showCustomSuccessAlert(response.message);
        } else {
          setIsSubmittingAddress(false);
          showCustomErrorAlert(response.message);
        }
      } catch (error) {
        setIsSubmittingAddress(false)
      } 
    };

    //delete address
    const handleDeleteAddress = async (id: number) => {
      try {
        await Swal.fire({
          title: 'Delete Address',
          text: 'Are you sure you want to delete this Shipping Address?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, Delete!',
          cancelButtonText: 'No, Cancel!',
          showLoaderOnConfirm: true,
          allowOutsideClick: () => !Swal.isLoading(),
          customClass: {
              confirmButton: 'btn btn-danger',
              cancelButton: 'btn btn-secondary',
          },
          preConfirm: async () => {
            try {
              const response = await fetchDataFromApi(`shipping/deactivate/${id}`, 'GET');
              if (response.status) {
                const updatedAddresses = addresses.filter(address => address.id !== id);
                setAddresses(updatedAddresses);
                showCustomSuccessAlert(response.message);
              } else {
                throw new Error(response.message);
              }
            } catch (error) {
              Swal.showValidationMessage(`Request failed: ${error}`);
            }
          }
        });
      } catch (error) {
        console.log(error);
      }
    };

    //update address
    const [editAddress, setEditAddress] = useState<Address | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const handleEditAddress = (address: Address) => {
      setEditAddress(address);
      setShowEditModal(true);
    };

    const handleEditAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (editAddress) {
          setEditAddress({
              ...editAddress,
              [e.target.name]: e.target.value
          });
      }
    };

    const [isSubmittingEditAddress, setIsSubmittingEditAddress] = useState(false);
    const handleSubmitEditAddress = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (editAddress) {
          setIsSubmittingEditAddress(true);
          try {
              const { id, ...newAddress } = editAddress; //remove id from address object
              const response = await fetchDataFromApi(`shipping/update/${id}`, 'POST', newAddress);
              if (response.status) {
                  const updatedAddresses = addresses.map(addr => addr.id === editAddress.id ? editAddress : addr);
                  setAddresses(updatedAddresses);
                  setShowEditModal(false);
                  showCustomSuccessAlert(response.message);
              } else {
                  showCustomErrorAlert(response.message);
              }
              setIsSubmittingEditAddress(false);
          } catch (error) {
            setIsSubmittingEditAddress(false);
            console.error(error);
          }
      }
    };

    return (
      <>
        <Row>
          <Col sm={12} md={3}>
            <div className='border bg-light p-3 fixed-sidebar'>
              <ListGroup>
                  <ListGroup.Item action href="#profile">Your Profile</ListGroup.Item>
                  <ListGroup.Item action href="#passwords">Change Password</ListGroup.Item>
                  <ListGroup.Item action href="#address">Delivery Address</ListGroup.Item>
              </ListGroup>
            </div>
          </Col>

          <Col sm={12} md={9}>
            {/* Profile Row */}
            <Row id='profile' className='mb-5'>
              <div className='p-4 bg-light rounded'>
              <h1 className='mb-4'>Update Profile</h1>
              <Form onSubmit={submitProfileForm}>
                  <Col md={6} className='mb-3'>
                  <Form.Group controlId="formUsername">
                    <Form.Label>Username<span className='text-danger'>*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={user?.username}
                      onChange={handleProfileDataChange}
                      readOnly
                    />
                  </Form.Group>
                  </Col>

                  <Row className='mb-3'>
                  <Col md={4}>
                  <Form.Group controlId="formFirstName">
                      <Form.Label>First Name<span className='text-danger'>*</span></Form.Label>
                      <Form.Control
                          type="text"
                          name="firstName"
                          value={user?.firstName}
                          onChange={handleProfileDataChange}
                      />
                  </Form.Group>
                  </Col>

                  <Col md={4}>
                  <Form.Group controlId="formLastName">
                      <Form.Label>Last Name<span className='text-danger'>*</span></Form.Label>
                      <Form.Control
                          type="text"
                          name="lastName"
                          value={user?.lastName}
                          onChange={handleProfileDataChange}
                      />
                  </Form.Group>
                  </Col>

                  <Col md={4}>
                  <Form.Group controlId="formMiddleName">
                      <Form.Label>Middle Name<span className='text-danger'>*</span></Form.Label>
                      <Form.Control
                          type="text"
                          name="middleName"
                          value={user?.middleName}
                          onChange={handleProfileDataChange}
                      />
                  </Form.Group>
                  </Col>
                  </Row>

                  <Row className='mb-3'>
                  <Col md={6}>
                  <Form.Group controlId="formEmail">
                      <Form.Label>Email<span className='text-danger'>*</span></Form.Label>
                      <Form.Control
                          type="email"
                          name="email"
                          value={user?.email}
                          onChange={handleProfileDataChange}
                      />
                  </Form.Group>
                  </Col>

                  <Col md={6}>
                  <Form.Group controlId="formPhone">
                      <Form.Label>Phone<span className='text-danger'>*</span></Form.Label>
                      <Form.Control
                          type="text"
                          name="phone"
                          value={user?.phone}
                          onChange={handleProfileDataChange}
                      />
                  </Form.Group>
                  </Col>
                  </Row>

                  <Form.Group controlId="formAddress">
                      <Form.Label>Address<span className='text-danger'>*</span></Form.Label>
                      <Form.Control
                          type="text"
                          name="address"
                          value={user?.address}
                          onChange={handleProfileDataChange}
                      />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="mt-3" disabled={isSubmittingProfile}>
                    {isSubmittingProfile ? (<ButtonLoader/>) : ("Update Profile")}
                  </Button>
              </Form>
              </div>
              
            </Row>

            {/* Password Row */}
            <Row id='passwords' className='mb-5'>
            <div className='p-4 bg-light rounded'>
                <h1 className='mb-4'>Update Password</h1>
                <Form onSubmit={handleSubmitPassword}>
                    <Col md={6} className='mb-3'>
                    <Form.Group controlId="formPassword">
                      <Form.Label>Current Password<span className='text-danger'>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="currentPassword"
                        value={password.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Form.Group>
                    </Col>

                    <Col md={6} className='mb-3'>
                    <Form.Group controlId="formNewPassword">
                      <Form.Label>New Password<span className='text-danger'>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="newPassword"
                        value={password.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Form.Group>
                    </Col>

                    <Col md={6} className='mb-3'>
                    <Form.Group controlId="formConfirmPassword">
                      <Form.Label>Confirm Password<span className='text-danger'>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="confirmPassword"
                        value={password.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Form.Group>
                    </Col>

                    <Button variant="primary" type="submit" className="mt-3" disabled={isSubmittingPassword}>
                        {isSubmittingPassword ? (<ButtonLoader/>) : ("Update Password")}
                    </Button>
                </Form>
                </div>
            </Row>
            
            {/* Address Row */}
            <Row id='address' className='mb-5'>
              <div className='p-4 bg-light rounded'>
                <h1 className='mb-4'>Shipping Addresses</h1>
                <div id="savedAddresses">
                  {addresses.length == 0 ? (
                    <p className="text-muted small">No shipping addresses added</p>
                  ) : (
                    <ListGroup>
                      {addresses.map((address, index) => (
                      <ListGroup.Item className='d-flex justify-content-between' key={index}>
                        <address>
                          <strong>{user?.firstName+' '+user?.lastName}</strong><br />
                          {address.location}<br />
                          {address.address}<br />
                          {address.street}<br />
                          {address.region}, {address.country}<br />
                          {address.landmark}
                        </address>

                        <div>
                          <span className="bg-primary bx bx-edit text-white p-1 rounded cursor-pointer small me-2" onClick={() => handleEditAddress(address)} title="Edit"></span>
                          <span className="bg-danger bx bx-x text-white p-1 rounded cursor-pointer small" onClick={() => handleDeleteAddress(address.id)} title="Delete"></span>
                        </div>
                      </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>

                <hr />

                <h5 className='mb-4'>Add Address</h5>
                <Form onSubmit={handleSubmitAddresses}>
                    <Row className='mb-3'>
                        <Col md={6}>
                            <Form.Group controlId="formStreet">
                                <Form.Label>Street<span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="street"
                                    value={address.street}
                                    onChange={handleAddressChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formCity">
                                <Form.Label>City<span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="location"
                                    value={address.location}
                                    onChange={handleAddressChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='mb-3'>
                        <Col md={6}>
                            <Form.Group controlId="formState">
                                <Form.Label>State<span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="region"
                                    value={address.region}
                                    onChange={handleAddressChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formCountry">
                                <Form.Label>Country<span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="country"
                                    value={address.country}
                                    onChange={handleAddressChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='mb-3'>
                        <Col md={6}>
                            <Form.Group controlId="formLandmark">
                                <Form.Label>Landmark<span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="landmark"
                                    value={address.landmark}
                                    onChange={handleAddressChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formAddress">
                                <Form.Label>Address<span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={address.address}
                                    onChange={handleAddressChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button variant="primary" type="submit" className="mt-3" disabled={isSubmittingAddress}>
                    {isSubmittingAddress ? (<ButtonLoader/>) : ("Add Address")}
                    </Button>
                </Form>
              </div>
            </Row>
          </Col>
      </Row>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Body className='p-4'>
            <h1 className='mb-4 text-center'>Update Address</h1>
            <Form onSubmit={handleSubmitEditAddress}>
                <Row className='mb-3'>
                    <Col md={6}>
                        <Form.Group controlId="formEditStreet">
                            <Form.Label>Street<span className='text-danger'>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="street"
                                value={editAddress?.street || ''}
                                onChange={handleEditAddressChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="formEditCity">
                            <Form.Label>City<span className='text-danger'>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={editAddress?.location || ''}
                                onChange={handleEditAddressChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className='mb-3'>
                    <Col md={6}>
                        <Form.Group controlId="formEditState">
                            <Form.Label>State<span className='text-danger'>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="region"
                                value={editAddress?.region || ''}
                                onChange={handleEditAddressChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="formEditCountry">
                            <Form.Label>Country<span className='text-danger'>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="country"
                                value={editAddress?.country || ''}
                                onChange={handleEditAddressChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className='mb-3'>
                    <Col md={6}>
                        <Form.Group controlId="formEditLandmark">
                            <Form.Label>Landmark<span className='text-danger'>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="landmark"
                                value={editAddress?.landmark || ''}
                                onChange={handleEditAddressChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="formEditAddress">
                            <Form.Label>Address<span className='text-danger'>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={editAddress?.address || ''}
                                onChange={handleEditAddressChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                  <Col className='mb-3 text-center'>
                  <Button variant="primary" type="submit" className="mt-3" disabled={isSubmittingEditAddress}>
                    {isSubmittingEditAddress ? (<ButtonLoader/>) : ("Update Address")}
                  </Button>

                  <Button variant="secondary" className="mt-3 ms-3" onClick={() => setShowEditModal(false)}>
                    Close
                  </Button>
                  </Col>
                </Row>
            </Form>
        </Modal.Body>
    </Modal>
    </>
  );
};