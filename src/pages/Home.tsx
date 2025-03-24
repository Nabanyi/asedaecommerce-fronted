import { Col, Form, ListGroup, Button, Row, Breadcrumb, InputGroup } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { fetchDataFromApi } from '../ApiHelper';
import { ProductItem, ProductItemsProps } from '../components/ProductItem';
import Spinner from '../components/Spinner';
import { BtnSpinner, ButtonLoader } from '../components/ButtonLoading';
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
export const Home = () => {
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
            console.log(error)
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
        const filters = {
            categories: selectedCategories,
            brands: selectedBrands,
            direction: sortBy,
            sortBy: filterBy,
            page: currentPage,
            size: pageSize,
        };
        setPageLoading(true);
        try {
            const response = await fetchDataFromApi('product/get', 'POST', filters);
            if (response.status) {
                setAds(response.result.content);
                setTotalPages(response.result.totalPages);
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
        console.log(deletedId);
    };

    const handleAdEdit = (editedId: string) => {
        console.log(editedId);
    };

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [filterBy, setFilterBy] = useState<string>('id');
    const [sortBy, setSortBy] = useState<string>('desc');
    const [pageSize, setPageSize] = useState<number>(15);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(3);

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageSize(parseInt(e.target.value));
    };

    const handleCurrentPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentPage(parseInt(e.target.value));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setSelectedCategories(prev =>
            e.target.checked ? [...prev, value] : prev.filter(id => id !== value)
        );
    };
    
    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setSelectedBrands(prev =>
            e.target.checked ? [...prev, value] : prev.filter(id => id !== value)
        );
    };
    
    const handleFilterByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterBy(e.target.value);
    };
    
    const handleSortByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSortBy(e.target.value);
    };

    useEffect(()=>{
        getCategories();
        getBrands();
        getMyAds();
    }, [])
    return (
        <>
        <Row>
            <Col xs={3} className='border rounded bg-light p-3 mt-3 mb-3'>
                <Form>                    
                    <div>
                        <span className='text-muted'>Brands:</span>
                        <ListGroup variant="flush">
                            {brands.map((brand:Brand, index:number) => (
                            <ListGroup.Item key={index}>
                            <Form.Check
                                className="me-1"
                                type="checkbox"
                                value={brand.id}
                                label={brand.name}
                                onChange={handleBrandChange}
                            />
                        </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>

                    <div className='mt-3'>
                        <span className='text-muted'>Category:</span>
                        <ListGroup variant="flush">
                            {categories.map((category:Category, index:number) => (
                            <ListGroup.Item key={index}>
                                <Form.Check
                                    className="me-1"
                                    type="checkbox"
                                    value={category.id}
                                    label={category.name}
                                    onChange={handleCategoryChange}
                                />
                            </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>

                    <div className='mt-3'>
                        <span className='text-muted'>Filter By:</span>
                        <ListGroup variant="flush">
                        <ListGroup.Item>
                            <Form.Check
                                className="me-1"
                                type="radio"
                                value="price"
                                name="filterBy"
                                id="filterByPrice"
                                label={'Price'}
                                onChange={handleFilterByChange}
                            />
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Form.Check
                                className="me-1"
                                type="radio"
                                name="filterBy"
                                value="id"
                                id="filterById"
                                label={'Id'}
                                onChange={handleFilterByChange}
                            />
                        </ListGroup.Item>
                        </ListGroup>
                    </div>

                    <div className='mt-3'>
                        <span className='text-muted'>Sort By:</span>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                            <Form.Check
                                className="me-1"
                                type="radio"
                                value="asc"
                                name="sortBy"
                                id="sortByAscending"
                                label={'Ascending Order'}
                                onChange={handleSortByChange}
                            />
                            </ListGroup.Item>
                            <ListGroup.Item>
                            <Form.Check
                                className="me-1"
                                type="radio"
                                value="desc"
                                name="sortBy"
                                id="sortByDescending"
                                label={'Descending Order'}
                                onChange={handleSortByChange}
                            />
                            </ListGroup.Item>
                        </ListGroup>
                    </div>

                    <div className='mt-3'>
                        <div className="d-grid gap-2">
                        <Button variant="primary" size="lg" onClick={getMyAds} disabled={pageLoading}>
                            {pageLoading ? (<ButtonLoader/>) : 'Apply Filters'}
                        </Button>
                        </div>
                    </div>
                </Form>
            </Col>

            <Col xs={9} className='mt-3 mb-3'>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Breadcrumb>
                        <Breadcrumb.Item href="/home">Home</Breadcrumb.Item>
                        <Breadcrumb.Item active>Ads</Breadcrumb.Item>
                    </Breadcrumb>

                    <div id='pager' className="d-flex align-items-center">
                        <p className="mb-0 me-2">Page:</p>
                        <Form.Select aria-label="Page" onChange={handleCurrentPage} value={currentPage} defaultValue="0" style={{ width: "auto" }} className="me-3">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <option key={i} value={i}>{i + 1}</option>
                        ))}
                        </Form.Select>
                        
                        <InputGroup className="w-auto me-2">
                            <InputGroup.Text id="basic-addon2">Size</InputGroup.Text>
                            <Form.Control
                                type='number'
                                step={1}
                                onChange={handlePageSizeChange}
                                value={pageSize}
                                style={{ width: "70px" }}
                            />
                        </InputGroup>

                        <Button variant="primary" onClick={getMyAds} disabled={pageLoading}>
                            {pageLoading ? (<BtnSpinner/>) : (<i className="bx bx-search"></i>)}
                        </Button>
                    </div>
                </div>
                
                
                {pageLoading ? (
                    <Col className='text-center'><Spinner/></Col>
                ) : (
                    <Row xs={1} md={2} lg={3} xl={3} className="g-4">
                        {ads === null ? (
                            <> <Col className='text-center'><p className="text-muted">No data found</p></Col> </>
                        ) : (
                        <>
                            {ads.map((item: ProductItemsProps) => (
                                <ProductItem key={item.id} {...item} isOwner={false} showFullButton={false} onAdDeleted={handleAdDeleted} onAdEdited={handleAdEdit} />
                            ))}
                        </>
                        )}
                    </Row>
                )}
            </Col>
        </Row>
        </>
    )
}