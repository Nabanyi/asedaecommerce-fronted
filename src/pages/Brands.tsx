import { useEffect, useRef, useState } from "react";
import jszip from "jszip";
import pdfmake from "pdfmake";
import DataTable from "datatables.net-react";
import DataTablesCore from "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.mjs";
import "datatables.net-buttons/js/buttons.print.mjs";
import "datatables.net-responsive-bs5";
import { fetchDataFromApi } from "../ApiHelper";
import { Button, Col, Dropdown, Row, Table, Modal, Form } from "react-bootstrap";
import { showCustomErrorAlert, showCustomSuccessAlert, getUserSessionData } from "../Helper";
import Swal from "sweetalert2";
import { ButtonLoader } from "../components/ButtonLoading";

DataTablesCore.Buttons.jszip(jszip);
DataTablesCore.Buttons.pdfMake(pdfmake);
DataTable.use(DataTablesCore);

export interface BrandData {
    id: string;
    userId: string;
    name: string;
    description: string;
    status: string;
    createdAt: string;
}

export const Brands = () => {
    const user = getUserSessionData();

    const [tableData, setTableData] = useState<BrandData[]>([]);
    const tableRef = useRef<HTMLTableElement | null>(null);
    const tableInstance = useRef<any>(null);

    // Fetch Data from API
    const getAllBrands = async () => {
        try {
            const response = await fetchDataFromApi("brand/get", "GET");
            if (response.status) {
                setTableData(response.result);
            } else {
                console.log(response.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if(user.role === "USER"){
            window.location.href = "/home";
        }

        getAllBrands();
    }, []);

    // initialise datatables
    useEffect(() => {
        if (!tableRef.current) return;

        // Initialize DataTable
        tableInstance.current = new DataTablesCore(tableRef.current, {
            data: tableData,
            destroy: true,
            autoWidth: true,
            processing: true,
            columns: [
                { data: "name" },
                { data: "description" },
                { 
                    data: null,
                    render: (_: any, __: any, row: BrandData) => {
                        if (row.status == "Active"){
                            return `<span class="p-1 bg-success text-white rounded-1 small">Active</span>`
                        }else{
                            return `<span class="p-1 bg-danger text-white rounded-1 small">Inactive</span>`
                        }
                    },
                },
                { data: "createdAt" },
                {
                    data: null,
                    render: (_: any, __: any, row: BrandData) =>
                        `<span class="edit-btn p-1 bg-primary text-white cursor-pointer rounded-1 small bx bxs-edit" data-id="${row.id}"></span>
                        <span class="delete-btn p-1 bg-danger text-white cursor-pointer rounded-1 small bx bx-trash" data-id="${row.id}"></span>`,
                    orderable: false,
                },
            ],
            responsive: true,
            buttons: ["copy", "csv", "excel", "pdf", "print"],
            layout: {
                topStart: "pageLength",
                top1End: "buttons",
            },
        });

        // Event Handlers
        const handleTableClick = (event: Event) => {
            const target = event.target as HTMLElement;
            const rowElement = target.closest("tr");
            if (!rowElement) return;

            const rowData = tableInstance.current.row(rowElement).data() as BrandData;

            if (target.classList.contains("edit-btn")) {
                setEditFormData(rowData);
                handleShowEditModal();
            } else if (target.classList.contains("delete-btn")) {
                deactiavteBrand(rowData.id);
            }
        };

        // Attach event listener
        tableRef.current.addEventListener("click", handleTableClick);

        return () => {
            tableRef.current?.removeEventListener("click", handleTableClick);
            tableInstance.current?.destroy();
        };
    }, [tableData]);

    // Function to handle export
    const handleExport = (type: string) => {
        if (tableInstance.current) {
            tableInstance.current.button(`.buttons-${type}`).trigger();
        }
    };

    // create functions
    const [showCreateModal, setShowCreateModal] = useState(false);
    const handleCloseCreateModal = () => setShowCreateModal(false);
    const handleShowCreateModal = () => setShowCreateModal(true);
    const [createFormData, setCreateFormData] = useState({name:"", description:"", status:"Active"})
    const[createLoading, setCreateLoading] = useState(false)
    const onCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCreateFormData({ ...createFormData, [name]: value});
    };
    const submitCreateBrand = async(e: React.FormEvent) => {
        e.preventDefault()
        
        setCreateLoading(true)

        try {
            const response = await fetchDataFromApi('brand/create', 'POST', createFormData);
            if (response.status) {
                const createdBrand: BrandData  = response.result;
                setTableData(prevData => [...prevData, createdBrand]);
                setCreateLoading(false);
                handleCloseCreateModal();
                showCustomSuccessAlert(response.message);
            } else {
                setCreateLoading(false);
                showCustomErrorAlert(response.message);
            }
        } catch (error) {
            setCreateLoading(false)
        }
    }

    // Edit functions
    const [showEditModal, setShowEditModal] = useState(false);
    const handleCloseEditModal = () => setShowEditModal(false);
    const handleShowEditModal = () => setShowEditModal(true);
    const [editFormData, setEditFormData] = useState({id:"", name:"", description:"", status:"Active"})
    const[editLoading, setEditLoading] = useState(false)
    const onEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value});
    };
    const submitEditBrand = async(e: React.FormEvent) => {
        e.preventDefault()
        
        setEditLoading(true)
        const editData = {name: editFormData.name, description: editFormData.description, status:"Active"}

        try {
            const response = await fetchDataFromApi('brand/update/'+editFormData.id, 'POST', editData);
            if (response.status) {
                //getAllBrands();
                updateBrandById(editFormData.id, editData);
                handleCloseEditModal();
                showCustomSuccessAlert(response.message);
            } else {
                
                showCustomErrorAlert(response.message);
            }
            setEditLoading(false);
        } catch (error) {
            setEditLoading(false)
        }
    }

    const updateBrandById = (idToUpdate: string, updatedData: Partial<BrandData>) => {
        setTableData((prevData) =>
            prevData.map((brand) =>
                brand.id === idToUpdate ? { ...brand, ...updatedData } : brand
            )
        );
    };

    // delete or deactivate
    const deactiavteBrand = async (brandId: any) => {
        try {
            await Swal.fire({
                title: 'Delete Brand',
                text: 'Are you sure you want to delete this brand?',
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
                        const response = await fetchDataFromApi(`brand/deactivate/${brandId}`, 'GET');

                        if (response.status) {
                            removeBrandById(brandId);
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

    const removeBrandById = (idToRemove: string) => {
        setTableData((prevData) => prevData.filter((brand) => brand.id !== idToRemove));
    };

    return (
        <>
            <Row className="mb-3 text-end">
                <Col className="d-flex justify-content-end gap-1">
                    <Button variant="primary" onClick={handleShowCreateModal}>
                        <i className="bx bx-plus"></i>
                    </Button>
                    <Dropdown>
                        <Dropdown.Toggle variant="primary" id="dropdown-basic">
                            Export
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleExport("excel")}>Excel</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleExport("csv")}>CSV</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleExport("copy")}>Copy</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleExport("pdf")}>PDF</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleExport("print")}>Print</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>

            <Table striped hover responsive ref={tableRef} id="brands-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
            </Table>

            <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
                <Modal.Body className="p-5">
                    <h1 className="text-center">Create Brand</h1>
                    <Form onSubmit={submitCreateBrand}>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control onChange={onCreateInputChange} value={createFormData.name} name="name" id="name" type="text" placeholder="name@example.com" autoFocus />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="description" >
                            <Form.Label>Brief Description<span className="text-danger">*</span></Form.Label>
                            <Form.Control onChange={onCreateInputChange} value={createFormData.description} as="textarea" id="description" name="description" rows={3} />
                        </Form.Group>

                        <Form.Group className="text-center">
                            <Button variant="primary" type="submit" className="me-2" onClick={handleCloseCreateModal}>
                                {createLoading ? (
                                    <ButtonLoader/>
                                ) : ('Create Brand')}
                            </Button>
                            <Button variant="secondary" type="button" onClick={handleCloseCreateModal}> Close </Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                <Modal.Body className="p-5">
                    <h1 className="text-center">Update Brand</h1>
                    <Form onSubmit={submitEditBrand}>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control onChange={onEditInputChange} value={editFormData.name} name="name" id="name" type="text" placeholder="name@example.com" autoFocus />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="description" >
                            <Form.Label>Brief Description<span className="text-danger">*</span></Form.Label>
                            <Form.Control onChange={onEditInputChange} value={editFormData.description} as="textarea" id="description" name="description" rows={3} />
                        </Form.Group>

                        <Form.Group className="text-center">
                            <Button variant="primary" type="submit" disabled={editLoading} className="me-2" onClick={handleCloseEditModal}>
                                {editLoading ? (
                                    <ButtonLoader/>
                                ) : ('Save Changes')}
                            </Button>
                            <Button variant="secondary" type="button" onClick={handleCloseEditModal}> Close </Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};
