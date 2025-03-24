import { Col, Button, Card, Badge } from 'react-bootstrap';
import TruncatedText from '../components/TruncatedText';
import { BASE_URL, fetchDataFromApi } from '../ApiHelper';
import Swal from 'sweetalert2';
import { showCustomSuccessAlert } from '../Helper';
import { CartButton } from './Cart';
import { useState } from 'react';


export interface ProductItemsProps {
    id: string;
    image: string;
    brand: string;
    name: string;
    category: string;
    price: string;
    description: string;
    maxLength?: number;
}

interface CartData{
    id:string;
    name:string;
    image:string;
    price:number;
    quantity:number;
    total:number;
}

export const ProductItem = (props: ProductItemsProps & { isOwner: boolean, showFullButton: boolean, onAdDeleted: (id: string) => void , onAdEdited: (id: string) => void }) => {
    const { isOwner, showFullButton, onAdDeleted, onAdEdited } = props;
    
    const  handleEditItem = (id: string) => {
        console.log("Edit Item Clicked:"+id)
        onAdEdited(id);
    }

    const [ad, setAd] = useState<CartData>({id:props.id, name:props.name, image:props.image, price:parseFloat(props.price), quantity:1, total:parseFloat(props.price)});

    const handleDeleteItem = async (id: any) => {
        try {
            await Swal.fire({
                title: 'Delete Ad',
                text: 'Are you sure you want to delete this Ad?',
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
                        const response = await fetchDataFromApi(`product/deactivate/${id}`, 'GET');
                        if (response.status) {
                            onAdDeleted(id);
                            showCustomSuccessAlert(response.message)
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

    return (
        <>
        <Col key={props.id}>
            <Card>
                <Card.Img variant="top" src={`${BASE_URL}uploads/${props.image}`} width={300} height={200} />
                <Card.Body>
                <Badge bg="secondary">{props.brand}</Badge>
                <Card.Title><a href={`/product/${props.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{props.name}</a></Card.Title>
                <p className="price-display">
                    <span className="amount">{props.price}</span>
                    <span className="currency">$</span>
                </p>
                <Card.Text>
                    <TruncatedText text={props.description} maxLength={50} />
                </Card.Text>
                
                <div className='text-end'>
                    {isOwner ? (
                        <>
                            <Button onClick={() => handleEditItem(props.id)} variant="link" className='text-end' title="Edit"><i className='bx bxs-edit bx-sm'></i></Button>
                            <Button onClick={() => handleDeleteItem(props.id)} variant="link" className='text-end text-danger' title="Delete"><i className='bx bx-trash-alt bx-sm'></i></Button>
                        </>
                    ) : 
                        <CartButton showFullButton={showFullButton} ad={ad}/>
                    }
                </div>
                </Card.Body>
            </Card>
        </Col>
        </>
    );
}