import { useParams } from "react-router-dom";
import { Col, Badge, Row, Tabs, Tab, Image, ListGroup, Button, Form, Breadcrumb } from 'react-bootstrap';
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { useEffect, useState } from "react";
import { BASE_URL, fetchDataFromApi } from "../ApiHelper";
import { ProductItemsProps } from "../components/ProductItem";
import { showCustomErrorAlert, showCustomSuccessAlert, timeAgo } from "../Helper";
import { ButtonLoader } from "../components/ButtonLoading";
import { CartButton } from "../components/Cart";

interface ProductDetails {
    id: string;
    categoryId: string;
    brandId: string;
    category: string;
    brand: string;
    name: string;
    description: string;
    specification: string;
    price: string;
    sku: string;
    status: string;
    images: string[];
}

interface Gallery{
    original:string;
    thumbnail:string;
}

interface Review{
    id: string;
    name: string;
    content: string; 
    productId: string;
    createdAt: string;
}

interface CartData{
    id:string;
    name:string;
    image:string;
    price:number;
    quantity:number;
    total:number;
}

export const Product = () => {
    const {productId} = useParams();
    //original: "https://picsum.photos/id/1018/1000/600/",

    const [propAd, setPropAd] = useState<CartData>({id:'', name:'', image:'', price:0, quantity:1, total:0});

    const [ad, setAd] = useState<ProductDetails>({
        id: '',
        categoryId: '',
        brandId: '',
        category: '',
        brand: '',
        name: '',
        description: '',
        specification: '',
        price: '',
        sku: '',
        status: '',
        images: [],
    });
    const[images, setImages] = useState<Gallery[]>([])
    const getAdDetails = async () => {
        try {
            const response = await fetchDataFromApi('product/single/'+productId, 'GET');
            if (response.status) {
                const result: ProductDetails = response.result;
                setAd(result);
                result.images.map((img) => {
                    setImages(prevImgs => [...prevImgs, {thumbnail:BASE_URL+'uploads/'+img, original:BASE_URL+'uploads/'+img} ]);
                })
                setPropAd({id:result.id, name:result.name, image:result.images[0], price:parseFloat(result.price), quantity:1, total:parseFloat(result.price)});
                getSimilarAd(result.brandId, result.categoryId);
            } else {
                console.log(response.message);
            }
        } catch (error) {
            console.log(false)
        }
    }

    const [ads, setAds] = useState<ProductItemsProps[]>([]);
    const [loadingSimilarProducts, setLoadingSimilarProducts] = useState(false);
    const getSimilarAd = async (brandId:any, categoryId:any) => {
        setLoadingSimilarProducts(true)
        try {
            const response = await fetchDataFromApi(`product/similar-products/${brandId}/${categoryId}`, 'GET');
            if (response.status) {
                const result: ProductItemsProps[] = response.result;
                setAds(result);
            } else {
                console.log(response.message);
            }

            setLoadingSimilarProducts(false)
        } catch (error) {
            setLoadingSimilarProducts(false)
            console.log(false)
        }
    }

    // REVIEW
    const [isReviewPosting, setIsReviewPosting] = useState(false);
    const [reviewFormData, setReviewFormData] = useState({name:'', content:'', productId:productId});
    const onReviewInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setReviewFormData({ ...reviewFormData, [name]: value});
    };
    const submitReview = async(e: React.FormEvent) => {
            e.preventDefault()
            
            setIsReviewPosting(true)
    
            try {
                const response = await fetchDataFromApi('reviews/create', 'POST', reviewFormData);
                if (response.status) {
                    const createdReview: Review  = response.result;
                    setReviews(prevData => [...prevData, createdReview]);
                    setReviewFormData({name:'', content:'', productId:productId});
                    setIsReviewPosting(false);
                    showCustomSuccessAlert(response.message);
                } else {
                    setIsReviewPosting(false);
                    showCustomErrorAlert(response.message);
                }
            } catch (error) {
                setIsReviewPosting(false)
            }
    }

    const [reviews, setReviews] = useState<Review[]>([]);
    const getAdReviews = async () => {
        try {
            const response = await fetchDataFromApi('reviews/get/'+productId, 'GET');
            if (response.status) {
                const result: Review[] = response.result;
                setReviews(result);
            } else {
                console.log(response.message);
            }
        } catch (error) {
            console.log(false)
        }
    }

    useEffect(() => {
        getAdDetails();
        getAdReviews();
    }, [])

    const [key, setKey] = useState('home');
    return(
        <>
        <Breadcrumb>
            <Breadcrumb.Item href="/home">Home</Breadcrumb.Item>
            <Breadcrumb.Item active>{ad.name}</Breadcrumb.Item>
        </Breadcrumb>
        <Row>
            <Col xs={8} className='mt-3 mb-3'>
                <ImageGallery items={images} showNav={false} thumbnailPosition="left"/>
            </Col>

            <Col xs={4} className='mt-3 mb-3'>
                <Badge bg="warning">{ad.brand}</Badge>
                <h1>{ad.name}</h1>
                <p className="text-muted"> {ad.category}</p>
                <p>{ad.description}</p>
                <p className="price-display">
                    <span className="amount">{ad.price}</span>
                    <span className="currency">$</span>
                </p>
                <CartButton ad={propAd} showFullButton={true} />
            </Col>
        </Row>

        <Row>
            <Col xs={8}>
                <Tabs
                id="controlled-tab-example"
                activeKey={key}
                onSelect={(k) => setKey(k as string)}
                className="mb-3"
                >
                    <Tab eventKey="home" title="Specifications">
                        <div dangerouslySetInnerHTML={{__html: ad.specification}}></div>
                    </Tab>

                    <Tab eventKey="profile" title="Reviews">

                        <Form onSubmit={submitReview} id="reviewForm" className="border rounded p-3 bg-light">
                            <h5>Add your review</h5>
                            <Form.Group className="mb-3" controlId="reviewForm.name">
                                <Form.Label>Username<span className="text-danger">*</span></Form.Label>
                                <Form.Control value={reviewFormData.name} onChange={onReviewInputChange} type="text" placeholder="Username" name="name" id="name" required />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="reviewForm.content">
                                <Form.Label>Review<span className="text-danger">*</span></Form.Label>
                                <Form.Control value={reviewFormData.content} onChange={onReviewInputChange} name="content" id="content" placeholder="Enter review here" as="textarea" rows={3} required/>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Button variant="primary" type="submit" disabled={isReviewPosting}>
                                    {isReviewPosting ? (
                                        <ButtonLoader/>
                                        ) : (
                                        <>Post Review</>
                                    )}
                                </Button>
                            </Form.Group>
                        </Form>

                        <ListGroup variant="flush">
                            {reviews.map((review, index) => (
                                <ListGroup.Item key={index} className="d-flex mb-3">
                                    <div className="flex-shrink-0">
                                        <Image src={`${BASE_URL}uploads/user.png`} width={60} height={60} alt="Reviewer" rounded />
                                    </div>
                                    <div className="flex-grow-1 ms-3 align-self-center">
                                        <div className="d-flex justify-content-between">
                                            <h6 className="fw-bolder">{review.name}</h6>
                                            <span className="text-muted small">{timeAgo(review.createdAt)}</span>
                                        </div>
                                        {review.content}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Tab>
                </Tabs>
            </Col>

            <Col xs={4}>
                <p>Similar Products:</p>
                {loadingSimilarProducts ? (
                    <><p className="text-muted text-center">No similar products found</p></>
                ) : (
                <>
                    {ads.map((p, idx) => (
                    <div key={idx} className="d-flex mb-3">
                        <div className="flex-shrink-0">
                            <a href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Image src={`${BASE_URL}uploads/${p.image}`} width={120} height="auto" alt="image" />
                            </a>
                        </div>
                        <div className="flex-grow-1 ms-3 align-self-center">
                            <Badge className="small" bg="secondary">{p.brand}</Badge>
                            <a href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h6 className="mt-2">{p.name}</h6>
                            <p className="price-display-small">
                                <span className="amount">{p.price}</span>
                                <span className="currency">$</span>
                            </p>
                            </a>
                        </div>
                    </div>
                    ))}
                </>)}
            </Col>
        </Row>
        </>
    )
}