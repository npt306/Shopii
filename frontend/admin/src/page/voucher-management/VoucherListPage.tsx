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
  Modal,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/general.css';

interface Voucher {
  id: number;
  name: string;
  code: string;
  starts_at: string;
  ends_at: string;
  per_customer_limit: number;
  total_usage_limit: number;
  condition_type: string;
  action_type: string;
  discount_amount?: number;
  discount_percentage?: number;
  min_order_amount?: number;
  created_at: string;
  updated_at: string;
}

export const VoucherListPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<number | null>(null);
    const navigate = useNavigate();


  useEffect(() => {
    const bootstrapLink = document.createElement('link');
    bootstrapLink.rel = 'stylesheet';
    bootstrapLink.href =
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    document.head.appendChild(bootstrapLink);
    document.title = 'Quản lý Voucher';

    const fetchVouchers = async () => {
      try {
        const response = await fetch('/api/vouchers'); // Use API Gateway route
        if (response.ok) {
          const data = await response.json();
          setVouchers(data);
        } else {
          setError('Failed to fetch vouchers.');
        }
      } catch (err) {
        setError('An error occurred while fetching vouchers.');
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const handleDeleteClick = (id: number) => {
    setVoucherToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (voucherToDelete === null) return;

    try {
      const response = await fetch(`/api/vouchers/${voucherToDelete}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Remove the deleted voucher from the state
        setVouchers(vouchers.filter((v) => v.id !== voucherToDelete));
        setShowDeleteModal(false);
      } else {
        setError('Failed to delete voucher.');
        setShowDeleteModal(false);
      }
    } catch (err) {
      setError('An error occurred while deleting the voucher.');
      setShowDeleteModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setVoucherToDelete(null);
  };
    const handleEditClick = (id: number) => {
        navigate(`/admin/vouchers/edit/${id}`);
    };


  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" role="status" variant="warning">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="shopee-page py-4">
      <div className="breadcrumb-placeholder mb-3">
        <h5 className="text-secondary">Trang chủ / Quản lý voucher</h5>
      </div>

      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h4 className="mb-0 text-dark">Danh sách Voucher</h4>
              <Link to="/admin/vouchers/add" className="btn btn-danger shopee-button">
                Thêm Voucher
              </Link>
            </Card.Header>
            <Card.Body>
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên Voucher</th>
                    <th>Mã</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((voucher) => {
                    const now = new Date();
                    const startsAt = new Date(voucher.starts_at);
                    const endsAt = new Date(voucher.ends_at);
                    let status = 'Sắp diễn ra';
                    if (now >= startsAt && now <= endsAt) {
                      status = 'Đang diễn ra';
                    } else if (now > endsAt) {
                      status = 'Đã kết thúc';
                    }

                    return (
                      <tr key={voucher.id}>
                        <td>{voucher.id}</td>
                        <td>{voucher.name}</td>
                        <td className="text-uppercase">{voucher.code}</td>
                        <td>{new Date(voucher.starts_at).toLocaleString()}</td>
                        <td>{new Date(voucher.ends_at).toLocaleString()}</td>
                        <td>
                            <span
                                className={`badge ${
                                status === 'Đang diễn ra'
                                    ? 'bg-success'
                                    : status === 'Sắp diễn ra'
                                    ? 'bg-warning'
                                    : 'bg-secondary'
                                }`}
                            >
                                {status}
                            </span>
                        </td>

                        <td>
                          <Link
                            to={`/admin/vouchers/${voucher.id}`}
                            className="btn btn-sm btn-outline-info me-2"
                          >
                            Xem
                          </Link>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditClick(voucher.id)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(voucher.id)}
                          >
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa voucher này?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
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