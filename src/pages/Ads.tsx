import { useEffect, useRef, useState } from 'react';
import { ProductItemsProps, ProductItem } from '../components/ProductItem';
import { Col, Form, Button, Row, Modal, Badge } from 'react-bootstrap';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import { BASE_URL, fetchDataFromApi, uploadToApi } from '../ApiHelper';
import { showCustomErrorAlert, showCustomSuccessAlert } from '../Helper';
import CircularSpinner from '../components/Spinner';
import Swal from 'sweetalert2';
import { ButtonLoader } from '../components/ButtonLoading';

interface Category{
    id: number,
    userId: number,
    name: string,
    description: string,
    status: string,
    createdAt: string
}
interface Brand{
    id: number,
    userId: number,
    name: string,
    description: string,
    status: string,
    createdAt: string
}

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

export const Ads = () => {
    // CREATE AD STARTS
    const [showCreateModal, setShowCreateModal] = useState(false);
    const handleCloseCreatModal = () => setShowCreateModal(false);
    const handleShowCreatModal = () => setShowCreateModal(true);

    const [images, setImages] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleFiles(Array.from(e.dataTransfer.files));
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
        handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        setImages((prevImages) => [...prevImages, ...imageFiles]);
    };

    const handleChooseFilesClick = () => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
    };
    
    const removeImage = (index: number) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const handleEditorChange = (newState:any) => {
        setEditorState(newState);
    };

    const[createAdData, setCreateAdData] = useState({
        specification: '',
        brand: '',
        price: '',
        name: '',
        status: 'Active',
        images: [],
        description: '',
        sku: '',
        category: ''
    })
    const[createLoading, setCreateLoading] = useState(false)
    const onCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCreateAdData({ ...createAdData, [name]: value});
    };
    const submitProduct = async(e: React.FormEvent) => {
        e.preventDefault()
        
        setCreateLoading(true)

        const formData = new FormData();
        images.forEach((image) => {
          formData.append('images', image);
        });
        formData.append('name', createAdData.name);
        formData.append('price', createAdData.price);
        formData.append('brand', createAdData.brand);
        formData.append('category', createAdData.category);
        formData.append('description', createAdData.description);
        formData.append('sku', createAdData.sku);
        formData.append('status', createAdData.status);
        const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        formData.append('specification', content);

        try {
            const response = await uploadToApi('product/create', 'POST', formData);
            if (response.status) {
                const createdAd: ProductItemsProps  = response.result;
                setAds(prevAds => [...prevAds, createdAd]);
                setCreateLoading(false);
                handleCloseCreatModal();
                setImages([]);
                setCreateAdData({
                    specification: '',
                    brand: '',
                    price: '',
                    name: '',
                    status: 'Active',
                    images: [],
                    description: '',
                    sku: '',
                    category: ''
                })
                showCustomSuccessAlert(response.message);
            } else {
                setCreateLoading(false);
                showCustomErrorAlert(response.message);
            }
        } catch (error) {
            setCreateLoading(false)
        }
    }
    // END - CREATE AD

    // EDIT AD STARTS
    const [showEditModal, setShowEditModal] = useState(false);
    const handleCloseEditModal = () => setShowEditModal(false);
    const handleShowEditModal = () => setShowEditModal(true);

    const [editImages, setEditImages] = useState<File[]>([]);
    const fileEditInputRef = useRef<HTMLInputElement>(null);

    const handleEditDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleEditDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleEditFiles(Array.from(e.dataTransfer.files));
    };

    const handleEditFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleEditFiles(Array.from(e.target.files));
        }
    };

    const handleEditFiles = (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        setEditImages((prevImages) => [...prevImages, ...imageFiles]);
    };

    const handleChooseEditFilesClick = () => {
        if (fileEditInputRef.current) {
            fileEditInputRef.current.click();
        }
    };

    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const handleAdEdit = async (editId: string) => {
        setIsDetailsLoading(true);
        handleShowEditModal();

        try {
            const response = await fetchDataFromApi('product/single/'+editId, 'GET');
            if (response.status) {
                const result:ProductDetails = response.result;
                setEditAdData({
                    specification: result.specification,
                    brand: result.brandId,
                    price: result.price,
                    name: result.name,
                    status: 'Active',
                    images: result.images,
                    description: result.description,
                    sku: result.sku,
                    category: result.categoryId,
                    id: result.id,
                });

                const blocksFromHTML = convertFromHTML(result.specification);
                const contentState = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
                setEditorEditState(EditorState.createWithContent(contentState));
            } else {
                console.log(response.message);
            }

            setIsDetailsLoading(false);
        } catch (error) {
            setIsDetailsLoading(false);
            console.log(false)
        }
    };

    const removeEditImage = (index: number) => {
        setEditImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const [editorEditState, setEditorEditState] = useState(EditorState.createEmpty());
    const handleEditorEditChange = (newState:any) => {
        setEditorEditState(newState);
    };

    const[editAdData, setEditAdData] = useState({
        specification: '',
        brand: '',
        price: '',
        name: '',
        status: 'Active',
        images: [''],
        description: '',
        sku: '',
        category: '',
        id: '',
    })

    const[editLoading, setEditLoading] = useState(false)
    const onEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditAdData({ ...editAdData, [name]: value});
    };

    const submitEditProduct = async(e: React.FormEvent) => {
        e.preventDefault()
        
        setEditLoading(true)

        const formData = new FormData();
        editImages.forEach((image) => {
          formData.append('images', image);
        });
        formData.append('name', editAdData.name);
        formData.append('price', editAdData.price);
        formData.append('brand', editAdData.brand);
        formData.append('category', editAdData.category);
        formData.append('description', editAdData.description);
        formData.append('sku', editAdData.sku);
        formData.append('status', editAdData.status);
        const content = draftToHtml(convertToRaw(editorEditState.getCurrentContent()));
        formData.append('specification', content);

        try {
            const response = await uploadToApi('product/update/'+editAdData.id, 'POST', formData);
            if (response.status) {
                const editedAd: ProductItemsProps  = response.result;
                updateAdById(editedAd.id, editedAd);
                setEditLoading(false);
                handleCloseEditModal();
                setEditImages([]);
                setEditAdData({
                    specification: '', brand: '', price: '', name: '', status: 'Active', images: [], description: '', sku: '', category: '', id: '',
                })
                showCustomSuccessAlert(response.message);
            } else {
                setEditLoading(false);
                showCustomErrorAlert(response.message);
            }
        } catch (error) {
            setEditLoading(false)
        }
    }

    const updateAdById = (idToUpdate: string, updatedData: Partial<ProductItemsProps>) => {
        setAds((prevData) =>
            prevData.map((ad) =>
                ad.id === idToUpdate ? { ...ad, ...updatedData } : ad
            )
        );
    };

    const deleteAdImage = async(image: string) => {
        try {
            await Swal.fire({
                title: 'Delete Image',
                text: 'Are you sure you want to delete this Image?',
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
                        const response = await fetchDataFromApi(`images/delete?image=${image}`, 'GET');
                        if (response.status) {
                            setEditAdData({...editAdData, images: editAdData.images.filter((img) => img !== image)});
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
    }
    // END EDIT AD

    const [categories, setCategories] = useState<Category[]>([]);
    const getCategories = async () => {
        try {
            const response = await fetchDataFromApi('category/get', 'GET');
            if (response.status) {
                const result = response.result;
                setCategories(result);
            } else {
                console.log(response.message);
            }
        } catch (error) {
            console.log(false)
        }
    }

    const [brands, setBrands] = useState<Brand[]>([]);
    const getBrands = async () => {
        try {
            const response = await fetchDataFromApi('brand/get', 'GET');
            if (response.status) {
                const result = response.result;
                setBrands(result);
            } else {
                console.log(response.message);
            }
        } catch (error) {
            console.log(false)
        }
    }

    const [ads, setAds] = useState<ProductItemsProps[]>([]);
    const [pageLoading, setPageLoading] = useState(false);
    const getMyAds = async() => {
        setPageLoading(true);
        try {
            const response = await fetchDataFromApi('product/user-ads', 'GET');
            if (response.status) {
                setAds(response.result);
            } else {
                console.log(response.message);
            }

            setPageLoading(false);
        } catch (error) {
            setPageLoading(false);
            console.log(false)
        }
    }

    const handleAdDeleted = (deletedId: string) => {
        setAds((prevAds) => prevAds.filter((ad) => ad.id !== deletedId));
    };

    useEffect(()=>{
        getCategories();
        getBrands();
        getMyAds();
    }, [])

    return (
    <>
        <Col className='mt-3 text-end'>
            <Button variant='primary' onClick={handleShowCreatModal}><i className='bx bx-plus'></i> New Ad</Button>
        </Col>

        {pageLoading ? (
            <>
            <Col className='text-center'>
                <CircularSpinner/>
            </Col>
            </>
        ) : (
            <>
            <Row xs={1} md={3} className="mt-3 g-4">
            {ads === null ? (
                <> <Col className='text-center'><p className="text-muted">No data found</p></Col> </>
            ) : (
            <>
                {ads.map((item: ProductItemsProps) => (
                    <ProductItem key={item.id} {...item} isOwner={true} showFullButton={true} onAdDeleted={handleAdDeleted} onAdEdited={handleAdEdit} />
                ))} 
            </>
            )}
            </Row>
            </>
        )}

        {/* CREATE MODAL */}
        <Modal 
        show={showCreateModal} 
        onHide={handleCloseCreatModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
            {/* <Modal.Header closeButton>
            <Modal.Title>Post Ad</Modal.Title>
            </Modal.Header> */}
            <Modal.Body className='p-5'>
                <h2 className='text-center'>Post Ad</h2>
                <Form onSubmit={submitProduct}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label>Category</Form.Label>
                                <Form.Select value={createAdData.category} name='category' onChange={onCreateInputChange} required>
                                    <option>Choose...</option>
                                    {categories.map((category:Category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label>SKU</Form.Label>
                                <Form.Control value={createAdData.sku} onChange={onCreateInputChange} type="text" name='sku' placeholder="21001" required/>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label>Price</Form.Label>
                                <Form.Control value={createAdData.price} onChange={onCreateInputChange} type="number" name='price' placeholder="0.00" required/>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label>Brand</Form.Label>
                                <Form.Select name='brand' value={createAdData.brand} onChange={onCreateInputChange} required>
                                    <option>Choose...</option>
                                    {brands.map((brand:Brand) => (
                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label>Name</Form.Label>
                                <Form.Control value={createAdData.name} onChange={onCreateInputChange} name='name' type="text" placeholder="Apple Airpods" required/>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label>Brief Description</Form.Label>
                                <Form.Control value={createAdData.description} onChange={onCreateInputChange} type="text" name='description' placeholder="Brief specifications" required/>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Label>Specification</Form.Label>
                            <Editor
                                editorState={editorState}
                                onEditorStateChange={handleEditorChange}
                                toolbar={{
                                    options: ["inline", "blockType", "fontSize", "list", "textAlign", "link"],
                                    inline: { options: ["bold", "italic", "underline", "strikethrough"] },
                                }}
                                editorStyle={{ height: "200px", border: "1px solid #ddd", padding: "10px" }}
                            />

                            <div className='mt-3'>
                                <div
                                    style={{
                                    border: '2px dashed #ccc',
                                    padding: '50px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    }}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={handleChooseFilesClick}
                                >
                                    Drag and drop images here or click to choose files.
                                </div>

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={handleFileInputChange}
                                />

                                <div style={{ marginTop: '20px' }}>
                                    {images.map((image, index) => (
                                    <div key={index} style={{ display: 'inline-block', margin: '10px', position: 'relative' }}>
                                        <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Preview ${index}`}
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                        <Badge bg="danger" style={{ position: 'absolute', top: '0', right: '0', cursor: 'pointer' }} onClick={() => removeImage(index)} >
                                            <i className='bx bx-x'></i>
                                        </Badge>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col className='text-center'>
                            <Button variant="secondary" onClick={handleCloseCreatModal}>
                                Close
                            </Button>

                            {images.length > 0 && (
                            <Button variant="primary" type='submit' disabled={createLoading}>
                                {createLoading ? 
                                (
                                <ButtonLoader/>
                                ) : ('Create Ad')}
                            </Button>
                            )}
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
        </Modal>

        {/* EDIT MODAL */}
        <Modal 
        show={showEditModal} 
        onHide={handleCloseEditModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
            <Modal.Body className='p-5'>
                <h2 className='text-center'>Update Ad</h2>
                {isDetailsLoading ? (
                    <>
                    <Row>
                        <Col className='text-center'>
                            <CircularSpinner/>
                        </Col>
                    </Row>
                    </>
                    ) : (
                    <>
                        <Form onSubmit={submitEditProduct} id='editForm'>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="editForm.category">
                                        <Form.Label>Category</Form.Label>
                                        <Form.Select value={editAdData.category} name='category' onChange={onEditInputChange} required>
                                            <option>Choose...</option>
                                            {categories.map((category:Category) => (
                                                <option key={category.id} value={category.id}>{category.name}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="editForm.sku">
                                        <Form.Label>SKU</Form.Label>
                                        <Form.Control value={editAdData.sku} onChange={onEditInputChange} type="text" name='sku' placeholder="21001" required/>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="editForm.price">
                                        <Form.Label>Price</Form.Label>
                                        <Form.Control value={editAdData.price} onChange={onEditInputChange} type="number" name='price' placeholder="0.00" required/>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="editForm.brand">
                                        <Form.Label>Brand</Form.Label>
                                        <Form.Select name='brand' value={editAdData.brand} onChange={onEditInputChange} required>
                                            <option>Choose...</option>
                                            {brands.map((brand:Brand) => (
                                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="editForm.name">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control value={editAdData.name} onChange={onEditInputChange} name='name' type="text" placeholder="Apple Airpods" required/>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="editForm.description">
                                        <Form.Label>Brief Description</Form.Label>
                                        <Form.Control value={editAdData.description} onChange={onEditInputChange} type="text" name='description' placeholder="Brief specifications" required/>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <Form.Label>Specification</Form.Label>
                                    <Editor
                                        editorState={editorEditState}
                                        onEditorStateChange={handleEditorEditChange}
                                        toolbar={{
                                            options: ["inline", "blockType", "fontSize", "list", "textAlign", "link"],
                                            inline: { options: ["bold", "italic", "underline", "strikethrough"] },
                                        }}
                                        editorStyle={{ height: "200px", border: "1px solid #ddd", padding: "10px" }}
                                    />

                                    <div className='mt-3'>
                                        <div
                                            style={{
                                            border: '2px dashed #ccc',
                                            padding: '50px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            }}
                                            onDragOver={handleEditDragOver}
                                            onDrop={handleEditDrop}
                                            onClick={handleChooseEditFilesClick}
                                        >
                                            Drag and drop images here or click to choose files.
                                        </div>

                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            ref={fileEditInputRef}
                                            onChange={handleEditFileInputChange}
                                        />

                                        <div style={{ marginTop: '20px' }}>
                                            {editAdData.images.map((image, index) => (
                                            <div key={index} style={{ display: 'inline-block', margin: '10px', position: 'relative' }}>
                                                <img
                                                src={`${BASE_URL}uploads/${image}`}
                                                alt={`Preview ${index}`}
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                />
                                                <Badge bg="danger" style={{ position: 'absolute', top: '0', right: '0', cursor: 'pointer' }} onClick={() => deleteAdImage(image)} >
                                                    <i className='bx bx-x'></i>
                                                </Badge>
                                            </div>
                                            ))}
                                        
                                            {editImages.map((image, index) => (
                                            <div key={index} style={{ display: 'inline-block', margin: '10px', position: 'relative' }}>
                                                <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index}`}
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                />
                                                <Badge bg="danger" style={{ position: 'absolute', top: '0', right: '0', cursor: 'pointer' }} onClick={() => removeEditImage(index)} >
                                                    <i className='bx bx-x'></i>
                                                </Badge>
                                            </div>
                                            ))}
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <Col className='text-center'>
                                    <Button className='me-2' variant="secondary" onClick={handleCloseEditModal}>
                                        Close
                                    </Button>

                                    <Button variant="primary" type='submit' disabled={editLoading}>
                                        {editLoading ? 
                                        (
                                        <ButtonLoader/>
                                        ) : ('Save Changes')}
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </>
                )}
            </Modal.Body>
        </Modal>
    </>
    )
}