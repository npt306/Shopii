import React, { useState, useEffect } from 'react';
import {
  Form,
  Container,
  Row,
  Col,
  Card,
  Button,
  InputGroup,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/general.css';

interface Voucher {
  id: number;
  name: string;
  description?: string;
  starts_at: string;
  ends_at: string;
  code: string;
  per_customer_limit: number;
  total_usage_limit: number;
  min_order_amount?: number;
  min_products?: number;
  product_ids?: number[];
  condition_type: string;
  action_type: string;
  discount_amount?: number;
  discount_percentage?: number;
  free_shipping_max?: number;
  buy_x_amount?: number;
  get_y_amount?: number;
  created_at: string;
  updated_at: string;
}

export const EditVoucherPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [voucherData, setVoucherData] = useState<Voucher>({
    id: 0,
    name: '',
    description: '',
    starts_at: '',
    ends_at: '',
    code: '',
    per_customer_limit: 1,
    total_usage_limit: 100,
    min_order_amount: 0,
    min_products: 0,
    condition_type: 'none',
    action_type: 'fixed_amount',
    discount_amount: 0,
    discount_percentage: 0,
    product_ids: [],
    free_shipping_max: 0,
    buy_x_amount: 0,
    get_y_amount: 0,
    created_at: '', 
    updated_at: '', 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const bootstrapLink = document.createElement('link');
    bootstrapLink.rel = 'stylesheet';
    bootstrapLink.href =
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    document.head.appendChild(bootstrapLink);
    document.title = 'Chỉnh sửa Voucher';

    const fetchVoucher = async () => {
      try {
        const response = await fetch(`/api/vouchers/${id}`);
        if (response.ok) {
          const data = await response.json();

          data.starts_at = new Date(data.starts_at)
            .toISOString()
            .slice(0, 16);
          data.ends_at = new Date(data.ends_at).toISOString().slice(0, 16);
          setVoucherData(data);
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

     return () => {
        if (document.head.contains(bootstrapLink)) {
            document.head.removeChild(bootstrapLink);
        }
    };
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (
      [
        'per_customer_limit',
        'total_usage_limit',
        'min_order_amount',
        'min_products',
        'discount_amount',
        'discount_percentage',
        'free_shipping_max',
        'buy_x_amount',
        'get_y_amount',
      ].includes(name)
    ) {
      setVoucherData({
        ...voucherData,
        [name]: parseInt(value, 10) || 0,
      });
    } else {
      setVoucherData({
        ...voucherData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setError(null);

    const apiData = {
      name: voucherData.name,
      description: voucherData.description,
      starts_at: new Date(voucherData.starts_at).toISOString(),
      ends_at: new Date(voucherData.ends_at).toISOString(),
      code: voucherData.code,
      per_customer_limit: voucherData.per_customer_limit,
      total_usage_limit: voucherData.total_usage_limit,
      min_order_amount: voucherData.min_order_amount,
      min_products: voucherData.min_products,
      condition_type: voucherData.condition_type,
      action_type: voucherData.action_type,
      discount_amount: voucherData.discount_amount,
      discount_percentage: voucherData.discount_percentage,
      product_ids: voucherData.product_ids,
      free_shipping_max: voucherData.free_shipping_max,
      buy_x_amount: voucherData.buy_x_amount,
      get_y_amount: voucherData.get_y_amount,
    };

    try {
      const response = await fetch(`/api/vouchers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData), 
      });

      if (response.ok) {
        setUpdateSuccess(true);

        navigate(`/admin/vouchers/${id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'An error occurred.');
        console.error('Error updating voucher:', errorData);
      }
    } catch (error) {
      setError('An unexpected error occurred.');
      console.error('Error updating voucher:', error);
    }
  };

  const handleCancel = () => {
    navigate(-1); 
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '200px' }}
      >
        <Spinner animation="border" role="status" variant="warning">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && !loading) { 
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
         <Button variant="secondary" onClick={handleCancel}>
            Quay lại
         </Button>
      </Container>
    );
  }

   if (!voucherData.id && !loading && !error) {
        return (
            <Container>
                <Alert variant="warning">Không tìm thấy thông tin voucher.</Alert>
                 <Button variant="secondary" onClick={handleCancel}>
                    Quay lại
                 </Button>
            </Container>
        );
    }

  return (
    <Container fluid className="shopee-page py-4">
      <div className="breadcrumb-placeholder mb-3">
        <h5 className="text-secondary">
          Trang chủ / Quản lý voucher / Chỉnh sửa voucher
        </h5>
      </div>

      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h4 className="mb-0 text-dark">Chỉnh sửa Voucher (ID: {voucherData.id})</h4>
            </Card.Header>
            <Card.Body>
              {updateSuccess && (
                <Alert variant="success">
                  Voucher updated successfully!
                </Alert>
              )}
              {}
              {error && !loading && (
                 <Alert variant="danger">{error}</Alert>
               )}
              <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                  <Col md={12}>
                    <h5 className="text-secondary border-bottom pb-2 mb-3">
                      Thông tin cơ bản
                    </h5>
                  </Col>

                  <Col md={6}>
                    {}
                    <Form.Group className="mb-3" controlId="editVoucherName">
                      <Form.Label className="fw-medium">
                        Tên voucher<span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={voucherData.name}
                        onChange={handleChange}
                        placeholder="Nhập tên voucher"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                     {}
                    <Form.Group className="mb-3" controlId="editVoucherCode">
                      <Form.Label className="fw-medium">
                        Mã voucher<span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="code"
                        value={voucherData.code}
                        onChange={handleChange}
                        placeholder="Nhập mã voucher"
                        className="text-uppercase"
                        required
                      />
                      <Form.Text className="text-muted">
                        Mã voucher sẽ được người dùng nhập để áp dụng giảm giá
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                     {}
                    <Form.Group className="mb-3" controlId="editVoucherDescription">
                      <Form.Label className="fw-medium">Mô tả</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={voucherData.description || ''} 
                        onChange={handleChange}
                        placeholder="Nhập mô tả cho voucher"
                        rows={3}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                     {}
                    <Form.Group className="mb-3" controlId="editVoucherStartDate">
                      <Form.Label className="fw-medium">
                        Ngày bắt đầu<span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="starts_at"
                        value={voucherData.starts_at}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                     {}
                    <Form.Group className="mb-3" controlId="editVoucherEndDate">
                      <Form.Label className="fw-medium">
                        Ngày kết thúc<span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="ends_at"
                        value={voucherData.ends_at}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                     {}
                    <Form.Group className="mb-3" controlId="editVoucherPerCustomerLimit">
                      <Form.Label className="fw-medium">
                        Giới hạn sử dụng mỗi khách hàng
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="per_customer_limit"
                        value={voucherData.per_customer_limit}
                        onChange={handleChange}
                        min="1"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                     {}
                    <Form.Group className="mb-3" controlId="editVoucherTotalUsageLimit">
                      <Form.Label className="fw-medium">
                        Tổng số lượt sử dụng tối đa
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="total_usage_limit"
                        value={voucherData.total_usage_limit}
                        onChange={handleChange}
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={12}>
                    <h5 className="text-secondary border-bottom pb-2 mb-3">
                      Điều kiện áp dụng
                    </h5>
                  </Col>

                  <Col md={12}>
                     {}
                    <Form.Group className="mb-3" controlId="editConditionType">
                      <Form.Label className="fw-medium">
                        Loại điều kiện
                      </Form.Label>
                      <Form.Select
                        name="condition_type"
                        value={voucherData.condition_type}
                        onChange={handleChange}
                      >
                        <option value="none">Không có điều kiện</option>
                        <option value="min_order">
                          Giá trị đơn hàng tối thiểu
                        </option>
                        <option value="min_products">
                          Số lượng sản phẩm tối thiểu
                        </option>
                        <option value="specific_products">
                          Sản phẩm cụ thể
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {voucherData.condition_type === 'min_order' && (
                    <Col md={6}>
                       {}
                      <Form.Group className="mb-3" controlId="editMinOrderAmount">
                        <Form.Label className="fw-medium">
                          Giá trị đơn hàng tối thiểu (VNĐ)
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            name="min_order_amount"
                            value={voucherData.min_order_amount || 0}
                            onChange={handleChange}
                            min="0"
                          />
                          <InputGroup.Text>₫</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  )}

                  {voucherData.condition_type === 'min_products' && (
                    <Col md={6}>
                       {}
                      <Form.Group className="mb-3" controlId="editMinProducts">
                        <Form.Label className="fw-medium">
                          Số lượng sản phẩm tối thiểu
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="min_products"
                          value={voucherData.min_products || 0}
                          onChange={handleChange}
                          min="1"
                        />
                      </Form.Group>
                    </Col>
                  )}

                  {voucherData.condition_type === 'specific_products' && (
                    <Col md={12} className="mb-3">
                      <div className="border rounded p-3 bg-light">
                        <p className="mb-2">
                          Chọn sản phẩm cụ thể (tính năng sẽ được cập nhật sau)
                        </p>
                        <Button variant="outline-secondary" size="sm">
                          <i className="me-1">+</i> Thêm sản phẩm
                        </Button>
                      </div>
                    </Col>
                  )}
                </Row>

                <Row className="mb-4">
                  <Col md={12}>
                    <h5 className="text-secondary border-bottom pb-2 mb-3">
                      Hành động giảm giá
                    </h5>
                  </Col>

                  <Col md={12}>
                     {}
                    <Form.Group className="mb-3" controlId="editActionType">
                      <Form.Label className="fw-medium">Loại giảm giá</Form.Label>
                      <Form.Select
                        name="action_type"
                        value={voucherData.action_type}
                        onChange={handleChange}
                      >
                        <option value="fixed_amount">
                          Giảm theo số tiền cố định
                        </option>
                        <option value="percentage">Giảm theo phần trăm</option>
                        <option value="product_percentage">
                          Giảm giá sản phẩm theo phần trăm
                        </option>
                        <option value="free_shipping">
                          Miễn phí vận chuyển
                        </option>
                        <option value="buy_x_get_y">Mua X tặng Y</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {voucherData.action_type === 'fixed_amount' && (
                    <Col md={6}>
                       {}
                      <Form.Group className="mb-3" controlId="editDiscountAmount">
                        <Form.Label className="fw-medium">
                          Số tiền giảm (VNĐ)
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            name="discount_amount"
                            value={voucherData.discount_amount || 0}
                            onChange={handleChange}
                            min="0"
                          />
                          <InputGroup.Text>₫</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  )}

                  {(voucherData.action_type === 'percentage' ||
                    voucherData.action_type === 'product_percentage') && (
                    <Col md={6}>
                       {}
                      <Form.Group className="mb-3" controlId="editDiscountPercentage">
                        <Form.Label className="fw-medium">
                          Phần trăm giảm giá (%)
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            name="discount_percentage"
                            value={voucherData.discount_percentage || 0}
                            onChange={handleChange}
                            min="0"
                            max="100"
                          />
                          <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  )}

                  {voucherData.action_type === 'free_shipping' && (
                    <Col md={6}>
                       {}
                      <Form.Group className="mb-3" controlId="editFreeShippingMax">
                        <Form.Label className="fw-medium">
                          Mức hỗ trợ vận chuyển tối đa (VNĐ)
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            name="free_shipping_max"
                            value={voucherData.free_shipping_max || 0}
                            onChange={handleChange}
                            min="0"
                          />
                          <InputGroup.Text>₫</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  )}

                  {voucherData.action_type === 'buy_x_get_y' && (
                    <>
                      <Col md={6}>
                         {}
                        <Form.Group className="mb-3" controlId="editBuyXAmount">
                          <Form.Label className="fw-medium">
                            Mua X sản phẩm
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="buy_x_amount"
                            value={voucherData.buy_x_amount || 0}
                            onChange={handleChange}
                            min="1"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                         {}
                        <Form.Group className="mb-3" controlId="editGetYAmount">
                          <Form.Label className="fw-medium">
                            Tặng Y sản phẩm
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="get_y_amount"
                            value={voucherData.get_y_amount || 0}
                            onChange={handleChange}
                            min="1"
                          />
                        </Form.Group>
                      </Col>
                    </>
                  )}
                </Row>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={handleCancel}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="danger"
                    type="submit"
                    className="shopee-button"
                  >
                    Cập nhật
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};