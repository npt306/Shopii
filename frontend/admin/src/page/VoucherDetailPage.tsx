import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import '../css/voucherPage.css';

interface Voucher {
  id: number;
  name: string;
  description?: string;
  code: string;
  starts_at: string;
  ends_at: string;
  per_customer_limit: number;
  total_usage_limit: number;
  condition_type: string;
  min_order_amount?: number;
  min_products?: number;
  product_ids?: number[];
  action_type: string;
  discount_amount?: number;
  discount_percentage?: number;
    free_shipping_max?: number;
    buy_x_amount?: number;
    get_y_amount?: number;
  created_at: string;
  updated_at: string;
}

export const VoucherDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapLink = document.createElement('link');
    bootstrapLink.rel = 'stylesheet';
    bootstrapLink.href =
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    document.head.appendChild(bootstrapLink);
      document.title = "Chi tiết Voucher";


    const fetchVoucher = async () => {
      try {
        const response = await fetch(`/api/vouchers/${id}`); // Use API Gateway route
        if (response.ok) {
          const data = await response.json();
          setVoucher(data);
        } else {
          setError('Failed to fetch voucher details.');
        }
      } catch (err) {
        setError('An error occurred while fetching voucher details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [id]);

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

  if (!voucher) {
    return (
      <Container>
        <Alert variant="info">Voucher not found.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="voucher-page py-4">
      <div className="breadcrumb-placeholder mb-3">
        <h5 className="text-secondary">
          Trang chủ / Quản lý voucher / Chi tiết voucher
        </h5>
      </div>

      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h4 className="mb-0 text-dark">Chi tiết Voucher</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Tên Voucher:</strong> {voucher.name}
                  </p>
                  <p>
                    <strong>Mã Voucher:</strong>{' '}
                    <span className="text-uppercase">{voucher.code}</span>
                  </p>
                  <p>
                    <strong>Mô tả:</strong> {voucher.description || 'N/A'}
                  </p>
                  <p>
                    <strong>Ngày bắt đầu:</strong>{' '}
                    {new Date(voucher.starts_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>Ngày kết thúc:</strong>{' '}
                    {new Date(voucher.ends_at).toLocaleString()}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Giới hạn sử dụng/khách:</strong>{' '}
                    {voucher.per_customer_limit}
                  </p>
                  <p>
                    <strong>Tổng lượt sử dụng tối đa:</strong>{' '}
                    {voucher.total_usage_limit}
                  </p>
                  <p>
                    <strong>Loại điều kiện:</strong>{' '}
                    {voucher.condition_type === 'none'
                      ? 'Không có'
                      : voucher.condition_type === 'min_order'
                      ? 'Giá trị đơn hàng tối thiểu'
                      : voucher.condition_type === 'min_products'
                      ? 'Số lượng sản phẩm tối thiểu'
                      : 'Sản phẩm cụ thể'}
                  </p>
                  {voucher.condition_type === 'min_order' && (
                    <p>
                      <strong>Giá trị đơn hàng tối thiểu:</strong>{' '}
                      {voucher.min_order_amount?.toLocaleString()} ₫
                    </p>
                  )}
                  {voucher.condition_type === 'min_products' && (
                    <p>
                      <strong>Số lượng sản phẩm tối thiểu:</strong>{' '}
                      {voucher.min_products}
                    </p>
                  )}
                   {voucher.condition_type === 'specific_products' && (
                        <p><strong>Sản phẩm cụ thể: </strong>
                            {voucher.product_ids && voucher.product_ids.length > 0 ? voucher.product_ids.join(', ') : "N/A"}
                        </p>
                    )}

                  <p>
                    <strong>Loại giảm giá:</strong>{' '}
                    {voucher.action_type === 'fixed_amount'
                      ? 'Giảm giá cố định'
                      : voucher.action_type === 'percentage'
                      ? 'Giảm giá phần trăm'
                      : voucher.action_type === 'product_percentage'
                      ? 'Giảm giá sản phẩm theo phần trăm'
                      : voucher.action_type === 'free_shipping'
                      ? 'Miễn phí vận chuyển'
                      : 'Mua X tặng Y'}
                  </p>
                  {voucher.action_type === 'fixed_amount' && (
                    <p>
                      <strong>Số tiền giảm:</strong>{' '}
                      {voucher.discount_amount?.toLocaleString()} ₫
                    </p>
                  )}
                  {(voucher.action_type === 'percentage' ||
                    voucher.action_type === 'product_percentage') && (
                    <p>
                      <strong>Phần trăm giảm giá:</strong>{' '}
                      {voucher.discount_percentage}%
                    </p>
                  )}
                    {voucher.action_type === "free_shipping" && (
                        <p>
                        <strong>Mức hỗ trợ vận chuyển tối đa:</strong>{' '}
                        {voucher.free_shipping_max?.toLocaleString()} ₫
                        </p>
                    )}

                    {voucher.action_type === "buy_x_get_y" && (
                        <>
                        <p>
                            <strong>Mua X sản phẩm: </strong> {voucher.buy_x_amount}
                        </p>
                        <p>
                            <strong>Tặng Y sản phẩm: </strong> {voucher.get_y_amount}
                        </p>
                        </>
                    )}
                </Col>
              </Row>
              <Row className="mt-4">
                <Col>
                  <Link to="/admin/vouchers" className="btn btn-secondary">
                    Quay lại
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};