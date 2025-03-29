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
    fetchProducts();
  }, [page, limit, statusFilter]); // Removed searchQuery from here

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `/api/product/admin/products?page=${page}&limit=${limit}`;
            if (statusFilter) {
                url += `&status=${statusFilter}`;
            }
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            const response = await fetch(url);
            if (response.ok) {
                const data: AdminProductListResponse = await response.json();
                setProducts(data.products);
                setTotal(data.total);
            } else {
                setError('Không thể tải danh sách sản phẩm.');
            }
        } catch (err) {
          setError('Đã xảy ra lỗi khi tải danh sách sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setPage(1);
        fetchProducts();
    };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/product/admin/products/${id}/approve`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setProducts(
          products.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p)),
        );
      } else {
        setError('Không thể duyệt sản phẩm.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi duyệt sản phẩm.');
    }
  };

  const handleBlockClick = (id: number) => {
    setProductToBlock(id);
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    if (!productToBlock) return;
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
        setProducts(
          products.map((p) =>
            p.id === productToBlock ? { ...p, status: 'Violated' } : p,
          ),
        );
        setShowBlockModal(false);
        setBlockReason('');
      } else {
        setError('Không thể chặn sản phẩm.');
        setShowBlockModal(false);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi chặn sản phẩm.');
      setShowBlockModal(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(
        `/api/product/admin/products/${productToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: deleteReason }),
        },
      );
      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productToDelete));
        setShowDeleteModal(false);
        setDeleteReason('');
      } else {
        setError('Không thể xóa sản phẩm.');
        setShowDeleteModal(false);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi xóa sản phẩm.');
      setShowDeleteModal(false);
    }
  };

  const handleCloseBlockModal = () => {
    setShowBlockModal(false);
    setProductToBlock(null);
    setBlockReason('');
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
    setDeleteReason('');
  };

  const totalPages = Math.ceil(total / limit);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

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
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                    >
                      <option value="">Tất cả</option>
                      <option value="Pending">Chờ duyệt</option>
                      <option value="Approved">Đã duyệt</option>
                      <option value="Violated">Vi phạm</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form onSubmit={handleSearchSubmit}>
                    <Form.Group>
                      <Form.Label>Tìm kiếm</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="text"
                          placeholder="Nhập tên sản phẩm"
                          value={searchQuery}
                          onChange={handleSearchChange}
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
              {error && <Alert variant="danger">{error}</Alert>}
              <Table responsive striped bordered hover>
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
                  {products.map((product) => (
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
                              ? 'bg-warning'
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
                        {/*{(product.status === 'Pending' || product.status === 'Violated') && (*/}
                        {['Pending', 'Violated'].includes(product.status) && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleApprove(product.id)}
                          >
                            Duyệt
                          </Button>
                        )}
                        {/*(product.status === 'Pending' || product.status === 'Approved') && (*/}
                        {['Pending','Approved'].includes(product.status) && (
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleBlockClick(product.id)}
                          >
                            Chặn
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(product.id)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {/* Pagination Controls */}
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="warning" />
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {total > 0
                      ? `Hiển thị ${
                          page * limit - limit + 1
                        } đến ${Math.min(
                          page * limit,
                          total,
                        )} trong tổng số ${total} sản phẩm`
                      : 'Không có sản phẩm'}
                  </div>
                  <div className="d-flex align-items-center">
                    <Form.Label className="me-2 mb-0">Hiển thị:</Form.Label>
                    <Form.Select
                      value={limit}
                      onChange={handleLimitChange}
                      style={{ width: 'auto' }}
                      className="me-3"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </Form.Select>
                    {pageNumbers.length > 1 && (
                      <div className="d-flex">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                          className="me-1"
                        >
                        </Button>
                        {pageNumbers.map((pageNumber) => (
                          <Button
                            key={pageNumber}
                            variant={
                              pageNumber === page
                                ? 'primary'
                                : 'outline-secondary'
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className="me-1"
                          >
                            {pageNumber}
                          </Button>
                        ))}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === totalPages}
                        >
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Block Confirmation Modal */}
      <Modal show={showBlockModal} onHide={handleCloseBlockModal}>
        <Modal.Header closeButton>
          <Modal.Title>Chặn sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Lý do chặn:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseBlockModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmBlock}>
            Chặn
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Lý do xóa:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </Form.Group>
          Bạn có chắc chắn muốn xóa sản phẩm này?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};