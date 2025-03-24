import { useEffect, useRef, useState } from 'react';
import jszip from "jszip";
import pdfmake from "pdfmake";
import DataTable from "datatables.net-react";
import DataTablesCore from "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.mjs";
import "datatables.net-buttons/js/buttons.print.mjs";
import "datatables.net-responsive-bs5";
import { Button, Col, Dropdown, ListGroup, Modal, Row, Table } from 'react-bootstrap';
import { fetchDataFromApi } from '../ApiHelper';
import { formatNumber } from '../Helper';

DataTablesCore.Buttons.jszip(jszip);
DataTablesCore.Buttons.pdfMake(pdfmake);
DataTable.use(DataTablesCore);

interface Address {
  id: number;
  country: string;
  region: string;
  location: string;
  address: string;
  street: string;
  landmark: string;
}

interface Item {
  item: string;
  quantity: number;
  price: number;
  total: number;
  transDate: string;
}

interface Order {
  orderid: number;
  status: string;
  transDate: string;
  address: Address;
  totalAmount: number;
  customer: string;
  items: Item[];
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

const Orders = () => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData) as AuthUser);
    }

    getOrdersMade();
    if (user?.role === "ADMIN") getOrdersReceived();
  }, []);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const handleCloseDetailsModal = () => setShowDetailsModal(false);
  const handleShowDetailsModal = () => setShowDetailsModal(true);
  const [orderDetailsData, setOrderDetailsData] = useState<Order>({
    orderid: 0,
    status: "",
    transDate: "",
    address: {
      id: 0,
      country: "",
      region: "",
      location: "",
      address: "",
      street: "",
      landmark: "",
    },
    totalAmount: 0,
    customer: "",
    items: [],
  })

  // ORDER MADE
  const [orderMadeTableData, setOrderMadeTableData] = useState<Order[]>([]);
  const tableOrderMadeRef = useRef<HTMLTableElement | null>(null);
  const tableOrderMadeInstance = useRef<any>(null);

  const getOrdersMade = async () => {
    try {
      const response = await fetchDataFromApi("orders/orders-placed", "GET");
      if (response.status) {
        setOrderMadeTableData(response.result);
      } else {
        console.log(response.message);
      }
    } catch (error) {
      console.error(error);
    }
  };
    
  // Function to handle export
  const handleExport = (type: string) => {
    if (tableOrderMadeInstance.current) {
      tableOrderMadeInstance.current.button(`.buttons-${type}`).trigger();
    }
  };

  useEffect(() => {
    if (!tableOrderMadeRef.current) return;

    // Initialize DataTable
    tableOrderMadeInstance.current = new DataTablesCore(tableOrderMadeRef.current, {
      data: orderMadeTableData,
      destroy: true,
      autoWidth: false,
      processing: true,
      columns: [
          { data: "orderid" },
          { data: "transDate" },
          { 
            data: null,
            render: (_: any, __: any, row: Order) => {
              return `${formatNumber(row.totalAmount, 2)}`
            }
          },
          { 
            data: null,
            render: (_: any, __: any, row: Order) => {
              if (row.status == "Pending") {
                return `<span class="p-1 bg-warning text-white rounded-1 small">Pending</span>`
              }else if(row.status == "In-Progress"){
                return `<span class="p-1 bg-primary text-white rounded-1 small">In-Progress</span>`
              }else{
                return `<span class="p-1 bg-success text-white rounded-1 small">Delivered</span>`
              }
            },
          },
          {
            data: null,
            render: (_: any, __: any, row: Order) =>
              `<address  class="table-address">
                <strong>${user?.firstName+' '+user?.lastName}</strong><br/>
                ${row.address.location}<br />
                ${row.address.address}<br />
                ${row.address.street}<br />
                ${row.address.region}, ${row.address.country}<br />
                ${row.address.landmark}
              </address>`,
            orderable: false,
          },
          {
            data: null,
            render: (_: any, __: any, row: Order) =>
              `<span class="edit-btn p-1 bg-primary text-white cursor-pointer rounded-1 small bx bxs-edit" data-id="${row.orderid}"></span>`,
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

      const rowData = tableOrderMadeInstance.current.row(rowElement).data() as Order;

      if (target.classList.contains("edit-btn")) {
        setOrderDetailsData(rowData);
        handleShowDetailsModal();
      }
    };

    // Attach event listener
    tableOrderMadeRef.current.addEventListener("click", handleTableClick);

    return () => {
      tableOrderMadeRef.current?.removeEventListener("click", handleTableClick);
      tableOrderMadeInstance.current?.destroy();
    };
  }, [orderMadeTableData]);

  // ORDER RECEIVED
  const [orderReceivedTableData, setOrderReceivedTableData] = useState<Order[]>([]);
  const tableOrderReceivedRef = useRef<HTMLTableElement | null>(null);
  const tableOrderReceivedInstance = useRef<any>(null);

  const getOrdersReceived = async () => {
    try {
      const response = await fetchDataFromApi("orders/orders-received", "GET");
      if (response.status) {
        setOrderReceivedTableData(response.result);
      } else {
        console.log(response.message);
      }
    } catch (error) {
      console.error(error);
    }
  };
    
  // Function to handle export
  const handleExportReceived = (type: string) => {
    if (tableOrderReceivedInstance.current) {
      tableOrderReceivedInstance.current.button(`.buttons-${type}`).trigger();
    }
  };
  useEffect(() => {
    if (!tableOrderReceivedRef.current) return;

    // Initialize DataTable
    tableOrderReceivedInstance.current = new DataTablesCore(tableOrderReceivedRef.current, {
      data: orderReceivedTableData,
      destroy: true,
      autoWidth: false,
      processing: true,
      columns: [
          { data: "orderid" },
          { data: "transDate" },
          { 
            data: null,
            render: (_: any, __: any, row: Order) => {
              return `${formatNumber(row.totalAmount, 2)}`
            }
          },
          { 
            data: null,
            render: (_: any, __: any, row: Order) => {
              if (row.status == "Pending") {
                return `<span class="p-1 bg-warning text-white rounded-1 small">Pending</span>`
              }else if(row.status == "In-Progress"){
                return `<span class="p-1 bg-primary text-white rounded-1 small">In-Progress</span>`
              }else{
                return `<span class="p-1 bg-success text-white rounded-1 small">Delivered</span>`
              }
            },
          },
          {
            data: null,
            render: (_: any, __: any, row: Order) =>
              `<address  class="table-address">
                <strong>${user?.firstName+' '+user?.lastName}</strong><br/>
                ${row.address.location}<br />
                ${row.address.address}<br />
                ${row.address.street}<br />
                ${row.address.region}, ${row.address.country}<br />
                ${row.address.landmark}
              </address>`,
            orderable: false,
          },
          {
            data: null,
            render: (_: any, __: any, row: Order) =>
              `<span class="edit-btn p-1 bg-primary text-white cursor-pointer rounded-1 small bx bxs-edit" data-id="${row.orderid}"></span>`,
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
    const handleTableClickReceived = (event: Event) => {
      const target = event.target as HTMLElement;
      const rowElement = target.closest("tr");
      if (!rowElement) return;

      const rowData = tableOrderReceivedInstance.current.row(rowElement).data() as Order;

      if (target.classList.contains("edit-btn")) {
        setOrderDetailsData(rowData);
        handleShowDetailsModal();
      }
    };

    // Attach event listener
    tableOrderReceivedRef.current.addEventListener("click", handleTableClickReceived);

    return () => {
      tableOrderReceivedRef.current?.removeEventListener("click", handleTableClickReceived);
      tableOrderReceivedInstance.current?.destroy();
    };
  }, [orderReceivedTableData]);
  return (
    <>
      <Row>
          <Col sm={12} md={3}>
            <div className='border bg-light p-3 fixed-sidebar'>
              <ListGroup>
                  <ListGroup.Item action href="#ordersMade">Orders Made</ListGroup.Item>
                  {user?.role === "ADMIN" && <ListGroup.Item action href="#ordersReceived">Orders Received</ListGroup.Item>}
              </ListGroup>
            </div>
          </Col>

          <Col sm={12} md={9}>
            <Row id='ordersMade' className='mb-5'>
              <div className='p-4 bg-light rounded'>
                <h1 className='mb-4'>Orders Made</h1>
                <Col className="d-flex justify-content-end gap-1">
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

                <Table striped hover responsive ref={tableOrderMadeRef} className='w-100' id="orders-made-table">
                  <thead>
                      <tr>
                        <th>Tracking Code</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Shipping Address</th>
                        <th>Action</th>
                      </tr>
                  </thead>
                </Table>
              </div>
            </Row>

            {user?.role === "ADMIN" && 
            <Row id='ordersReceived' className='mb-5'>
              <div className='p-4 bg-light rounded'>
                <h1 className='mb-4'>Orders Received</h1>
                <Col className="d-flex justify-content-end gap-1">
                    <Dropdown>
                      <Dropdown.Toggle variant="primary" id="dropdown-basic">
                        Export
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleExportReceived("excel")}>Excel</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleExportReceived("csv")}>CSV</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleExportReceived("copy")}>Copy</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleExportReceived("pdf")}>PDF</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleExportReceived("print")}>Print</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                </Col>

                <Table striped hover responsive ref={tableOrderReceivedRef} className='w-100' id="orders-made-table">
                  <thead>
                      <tr>
                        <th>Tracking Code</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Shipping Address</th>
                        <th>Action</th>
                      </tr>
                  </thead>
                </Table>
              </div>
            </Row>}
          </Col>
        </Row>

      <Modal show={showDetailsModal} size="lg" onHide={handleCloseDetailsModal} centered>
          <Modal.Body className="p-5">
            <h1 className="text-center">Details</h1>
            <div className='d-flex justify-content-between'>
                <div>
                  <p><strong>Tracking Code: </strong>{orderDetailsData.orderid}</p>
                  <p><strong>Date: </strong>
                    {new Date(orderDetailsData.transDate).toLocaleDateString()}
                  </p>
                  <p><strong>Status: </strong>{orderDetailsData.status}</p>
                </div>

                <p className='align-self-center'><strong>Customer: </strong>{user?.firstName+' '+user?.lastName}</p>
            </div>
            <Table className='table mt-3 mb-3 border' striped hover>
              <thead className='th-light'>
                  <tr>
                      <th>SN</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                  </tr>
              </thead>
              <tbody>
                  {orderDetailsData.items.map((item:Item, index:number) => (
                      <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.item}</td>
                          <td>{item.quantity}</td>
                          <td>{formatNumber(item.price, 2)}</td>
                          <td>{formatNumber(item.total, 2)}</td>
                      </tr>
                  ))}
              </tbody>
              <tfoot>
                  <tr>
                    <th colSpan={4} className='text-end'>Total:</th>
                    <th>{formatNumber(orderDetailsData.totalAmount, 2)}</th>
                  </tr>
              </tfoot>
            </Table>

            <div>
              <address>
                <strong>Shipping Address</strong><br />
                {orderDetailsData.address.location}<br />
                {orderDetailsData.address.address}<br />
                {orderDetailsData.address.street}<br />
                {orderDetailsData.address.region}, {orderDetailsData.address.country}<br />
                {orderDetailsData.address.landmark}
              </address>
            </div>

            <div className="text-center">
              <Button variant="secondary" type="button" onClick={handleCloseDetailsModal}> Close </Button>
            </div>
          </Modal.Body>
      </Modal>
    </>
  );
};

export default Orders;