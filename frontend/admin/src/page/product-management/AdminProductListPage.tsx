import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Spinner,
  Alert,
  Form,
  Modal,
  Pagination
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../../css/general.css';

interface Product {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  minPrice: number;
  maxPrice: number;
}

interface AdminProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export const AdminProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToBlock, setProductToBlock] = useState<number | null>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    const bootstrapLink = document.createElement('link');
    bootstrapLink.rel = 'stylesheet';
    bootstrapLink.href =
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    document.head.appendChild(bootstrapLink);
    document.title = 'Quản lý sản phẩm';

     // Cleanup function
     return () => {
        if (document.head.contains(bootstrapLink)) {
            document.head.removeChild(bootstrapLink);
        }
    };
  }, []); // Empty dependency array ensures this runs only once on mount


  // Separate useEffect for fetching data based on dependencies
  useEffect(() => {
      fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter]); // Trigger fetch when these change


    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            // Build the query string carefully
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (statusFilter) {
                params.append('status', statusFilter);
            }
            if (searchQuery) {
                 // Append search query only if it's not empty AFTER submitting search
                 // The actual search trigger is handleSearchSubmit
                params.append('search', searchQuery);
            }

            const url = `/api/product/admin/products?${params.toString()}`;
            console.log("Fetching URL:", url); // Debugging log

            const response = await fetch(url);
            if (response.ok) {
                const data: AdminProductListResponse = await response.json();
                setProducts(data.products);
                setTotal(data.total);
                 // Adjust page if current page becomes invalid after filtering/deletion
                 if (data.total > 0 && page > Math.ceil(data.total / limit)) {
                    setPage(Math.ceil(data.total / limit));
                 } else if (data.total === 0) {
                     setPage(1); // Reset to page 1 if no results
                 }
            } else {
                const errorData = await response.json();
                setError(`Không thể tải danh sách sản phẩm: ${errorData.message || response.statusText}`);
            }
        } catch (err) {
          setError(`Đã xảy ra lỗi khi tải danh sách sản phẩm: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
    }
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1); // Reset to the first page when changing the limit
  };

  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setStatusFilter(event.target.value);
    setPage(1);
    // Fetch is triggered by useEffect dependency change
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only update the state, don't trigger fetch here
    setSearchQuery(event.target.value);
  };

    const handleSearchSubmit = (event?: React.FormEvent) => {
        if(event) event.preventDefault();
        setPage(1); // Reset page on new search
        fetchProducts(); // Manually trigger fetch after search submit
    };

  const handleApprove = async (id: number) => {
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`/api/product/admin/products/${id}/approve`, {
        method: 'PATCH',
      });
      if (response.ok) {
        // Refetch data to ensure consistency, or update local state optimistically
        // Optimistic update:
        setProducts(
          products.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p)),
        );
        // Or refetch: fetchProducts();
      } else {
        const errorData = await response.json();
        setError(`Không thể duyệt sản phẩm: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi duyệt sản phẩm: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleBlockClick = (id: number) => {
    setProductToBlock(id);
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    if (!productToBlock) return;
    setError(null);
    try {
      const response = await fetch(
        `/api/product/admin/products/${productToBlock}/block`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: blockReason }),
        },
      );
      if (response.ok) {
         // Optimistic update:
        setProducts(
          products.map((p) =>
            p.id === productToBlock ? { ...p, status: 'Violated' } : p,
          ),
        );
        // Or refetch: fetchProducts();
        handleCloseBlockModal(); // Close modal on success
      } else {
        const errorData = await response.json();
        setError(`Không thể chặn sản phẩm: ${errorData.message || response.statusText}`);
        // Keep modal open on error to show message or let user retry
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi chặn sản phẩm: ${err instanceof Error ? err.message : String(err)}`);
       // Keep modal open
    }
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setError(null);
    try {
      const response = await fetch(
        `/api/product/admin/products/${productToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: deleteReason }), // Ensure reason is sent if required by API
        },
      );
      if (response.ok || response.status === 204) { // Handle 204 No Content
        // Refetch data is safer after deletion to handle pagination correctly
        fetchProducts();
        handleCloseDeleteModal(); // Close modal on success
      } else {
         const errorData = await response.json();
        setError(`Không thể xóa sản phẩm: ${errorData.message || response.statusText}`);
        // Keep modal open
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi xóa sản phẩm: ${err instanceof Error ? err.message : String(err)}`);
       // Keep modal open
    }
  };

  const handleCloseBlockModal = () => {
    setShowBlockModal(false);
    setProductToBlock(null);
    setBlockReason('');
    // setError(null); // Optionally clear error when manually closing modal
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
    setDeleteReason('');
    // setError(null); // Optionally clear error when manually closing modal
  };

  const totalPages = Math.ceil(total / limit);

  // --- Pagination Rendering Logic ---
  const renderPaginationItems = () => {
      const items = [];
      const maxPagesToShow = 5; // Adjust as needed
      let startPage, endPage;

      if (totalPages <= maxPagesToShow) {
          startPage = 1;
          endPage = totalPages;
      } else {
          const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
          const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
          if (page <= maxPagesBeforeCurrent) {
              startPage = 1;
              endPage = maxPagesToShow;
          } else if (page + maxPagesAfterCurrent >= totalPages) {
              startPage = totalPages - maxPagesToShow + 1;
              endPage = totalPages;
          } else {
              startPage = page - maxPagesBeforeCurrent;
              endPage = page + maxPagesAfterCurrent;
          }
      }

      // Always add 'First' button
      items.push(
          <Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={page === 1} />
      );

       // Always add 'Prev' button
       items.push(
           <Pagination.Prev key="prev" onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
       );


      if (startPage > 1) {
          items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
      }

      for (let number = startPage; number <= endPage; number++) {
          items.push(
              <Pagination.Item key={number} active={number === page} onClick={() => handlePageChange(number)}>
                  {number}
              </Pagination.Item>
          );
      }

      if (endPage < totalPages) {
          items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      }

       // Always add 'Next' button
       items.push(
           <Pagination.Next key="next" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
       );

        // Always add 'Last' button
        items.push(
            <Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
        );


      return items;
  };


  return (
    <Container fluid className="shopee-page py-4">
      <div className="breadcrumb-placeholder mb-3">
        <h5 className="text-secondary">Trang chủ / Quản lý sản phẩm</h5>
      </div>

      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h4 className="mb-0 text-dark">Danh sách sản phẩm</h4>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3 gy-2"> {/* Added gy-2 for vertical gap on small screens */}
                <Col md={4}>
                  {/* FIX: Add controlId */}
                  <Form.Group controlId="productStatusFilter">
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      aria-label="Lọc sản phẩm theo trạng thái"
                    >
                      <option value="">Tất cả</option>
                      <option value="Pending">Chờ duyệt</option>
                      <option value="Approved">Đã duyệt</option>
                      <option value="Violated">Vi phạm</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={8}>
                  {/* FIX: Add controlId */}
                  <Form onSubmit={handleSearchSubmit}>
                    <Form.Group controlId="productSearchInput">
                      <Form.Label>Tìm kiếm</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="text"
                          placeholder="Nhập tên sản phẩm"
                          value={searchQuery}
                          onChange={handleSearchInputChange}
                          aria-label="Tìm kiếm sản phẩm theo tên"
                        />
                        <Button
                          variant="primary"
                          type="submit"
                          className="ms-2 shopee-button"
                        >
                          Tìm
                        </Button>
                      </div>
                    </Form.Group>
                  </Form>
                </Col>
              </Row>
              {/* Display error above the table */}
              {error && !loading && <Alert variant="danger">{error}</Alert>}

              {loading ? (
                 <div className="text-center py-5">
                    <Spinner animation="border" variant="warning" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </Spinner>
                 </div>
              ) : (
                <>
                  <Table responsive striped bordered hover className="align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tên sản phẩm</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Ngày cập nhật</th>
                        <th>Giá thấp nhất</th>
                        <th>Giá cao nhất</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length > 0 ? (
                         products.map((product) => (
                            <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>
                                <Link to={`/admin/products/${product.id}`}>
                                    {product.name}
                                </Link>
                            </td>
                            <td>
                                <span
                                className={`badge ${
                                    product.status === 'Approved'
                                    ? 'bg-success'
                                    : product.status === 'Pending'
                                    ? 'bg-warning text-dark' // Added text-dark for better contrast on yellow
                                    : 'bg-danger'
                                }`}
                                >
                                {product.status === 'Approved'
                                    ? 'Đã duyệt'
                                    : product.status === 'Pending'
                                    ? 'Chờ duyệt'
                                    : 'Vi phạm'}
                                </span>
                            </td>
                            <td>{new Date(product.createdAt).toLocaleString()}</td>
                            <td>{new Date(product.updatedAt).toLocaleString()}</td>
                            <td>{product.minPrice.toLocaleString()} ₫</td>
                            <td>{product.maxPrice.toLocaleString()} ₫</td>
                            <td>
                                {/* Conditional rendering of buttons */}
                                {['Pending', 'Violated'].includes(product.status) && (
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    className="me-1 mb-1" // Added mb-1 for spacing on wrap
                                    onClick={() => handleApprove(product.id)}
                                    title="Duyệt sản phẩm" // Added title for accessibility
                                >
                                    Duyệt
                                </Button>
                                )}
                                {['Pending','Approved'].includes(product.status) && (
                                <Button
                                    variant="outline-warning"
                                    size="sm"
                                    className="me-1 mb-1"
                                    onClick={() => handleBlockClick(product.id)}
                                    title="Chặn sản phẩm"
                                >
                                    Chặn
                                </Button>
                                )}
                                <Button
                                variant="outline-danger"
                                size="sm"
                                className="mb-1"
                                onClick={() => handleDeleteClick(product.id)}
                                title="Xóa sản phẩm"
                                >
                                Xóa
                                </Button>
                            </td>
                            </tr>
                         ))
                      ) : (
                         <tr>
                             <td colSpan={8} className="text-center text-muted">Không tìm thấy sản phẩm nào.</td>
                         </tr>
                      )}
                    </tbody>
                  </Table>
                   {/* Pagination Controls */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3">
                        <div className='mb-2 mb-md-0'>
                            {total > 0
                            ? `Hiển thị ${
                                (page - 1) * limit + 1 // Corrected start index
                                } đến ${Math.min(
                                page * limit,
                                total,
                                )} trong tổng số ${total} sản phẩm`
                            : 'Không có sản phẩm'}
                        </div>
                        <div className="d-flex align-items-center">
                            <Form.Label htmlFor="itemsPerPageSelect" className="me-2 mb-0 visually-hidden">Sản phẩm mỗi trang:</Form.Label>
                            <Form.Select
                                id="itemsPerPageSelect"
                                value={limit}
                                onChange={handleLimitChange}
                                style={{ width: 'auto' }}
                                className="me-3"
                                aria-label="Số sản phẩm hiển thị mỗi trang"
                            >
                                <option value={10}>10 / trang</option>
                                <option value={25}>25 / trang</option>
                                <option value={50}>50 / trang</option>
                                <option value={100}>100 / trang</option>
                            </Form.Select>
                            {totalPages > 1 && (
                                <Pagination size="sm" className="mb-0">
                                    {renderPaginationItems()}
                                </Pagination>
                            )}
                        </div>
                    </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Block Confirmation Modal */}
      <Modal show={showBlockModal} onHide={handleCloseBlockModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chặn sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           {/* Display error inside the modal */}
           {error && showBlockModal && <Alert variant="danger">{error}</Alert>}
           {/* FIX: Add controlId */}
          <Form.Group controlId="blockReasonTextarea">
            <Form.Label>Lý do chặn:<span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              required // Make reason required if needed by API
              aria-describedby="blockReasonHelp"
            />
             <Form.Text id="blockReasonHelp" muted>
                Vui lòng nhập lý do chặn sản phẩm.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseBlockModal}>
            Hủy
          </Button>
          <Button variant="warning" onClick={confirmBlock} disabled={!blockReason}> {/* Disable if reason is empty */}
            Chặn
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Display error inside the modal */}
           {error && showDeleteModal && <Alert variant="danger">{error}</Alert>}
           {/* FIX: Add controlId */}
          <Form.Group className="mb-3" controlId="deleteReasonTextarea">
            <Form.Label>Lý do xóa (không bắt buộc):</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              aria-describedby="deleteReasonHelp"
            />
             <Form.Text id="deleteReasonHelp" muted>
                Nhập lý do xóa (nếu có).
            </Form.Text>
          </Form.Group>
          <p className="text-danger fw-bold">Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Xóa vĩnh viễn
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};