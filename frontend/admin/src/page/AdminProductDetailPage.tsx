import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import '../css/general.css';

interface ProductDetail {
  type_id: number;
  type_1: string;
  type_2: string;
  image: string;
  price: number;
  quantity: number;
}

interface Product {
  name: string;
  description: string;
  categories: string[];
  images: string[];
  soldQuantity: number;
  rating: number;
  coverImage: string;
  video: string;
  quantity: number;
  reviews: number;
  classifications: { classTypeName: string; level: number }[];
  details: ProductDetail[];
}

export const AdminProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapLink = document.createElement('link');
    bootstrapLink.rel = 'stylesheet';
    bootstrapLink.href =
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    document.head.appendChild(bootstrapLink);
    document.title = 'Chi tiết sản phẩm';

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/product/admin/products/${id}`);
        if (response.ok) {
          const data: Product = await response.json();
          setProduct(data);
        } else {
          setError('Không thể tải thông tin sản phẩm.');
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải thông tin sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <Alert variant="info">Sản phẩm không tồn tại.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="shopee-page py-4">
      {' '}
      {/* Reuse shopee-page class */}
      <div className="breadcrumb-placeholder mb-3">
        <h5 className="text-secondary">
          Trang chủ / Quản lý sản phẩm / Chi tiết sản phẩm
        </h5>
      </div>
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h4 className="mb-0 text-dark">Chi tiết sản phẩm</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Tên sản phẩm:</strong> {product.name}
                  </p>
                  <p>
                    <strong>Mô tả:</strong> {product.description}
                  </p>
                  <p>
                    <strong>Danh mục:</strong>{' '}
                    {product.categories.join(', ')}
                  </p>
                  <p>
                    <strong>Số lượng đã bán:</strong> {product.soldQuantity}
                  </p>
                  <p>
                    <strong>Đánh giá:</strong> {product.rating}
                  </p>
                  <p>
                    <strong>Số lượng đánh giá:</strong> {product.reviews}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Ảnh bìa:</strong>{' '}
                    <img
                      src={product.coverImage}
                      alt="Cover"
                      style={{ maxWidth: '100px' }}
                    />
                  </p>
                  <p>
                    <strong>Video:</strong>{' '}
                    {product.video ? (
                      <a href={product.video} target="_blank" rel="noreferrer">
                        Xem video
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </p>
                  <p>
                    <strong>Tổng số lượng:</strong> {product.quantity}
                  </p>
                  <p>
                    <strong>Phân loại:</strong>
                  </p>
                  <ul>
                    {product.classifications.map((c, index) => (
                      <li key={index}>
                        {c.classTypeName} (Cấp độ: {c.level})
                      </li>
                    ))}
                  </ul>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <h5>Chi tiết sản phẩm:</h5>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Loại 1</th>
                        <th>Loại 2</th>
                        <th>Hình ảnh</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.details.map((detail, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{detail.type_1}</td>
                          <td>{detail.type_2}</td>
                          <td>
                            <img
                              src={detail.image}
                              alt="Detail"
                              style={{ maxWidth: '50px' }}
                            />
                          </td>
                          <td>{detail.price.toLocaleString()} ₫</td>
                          <td>{detail.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col>
                  <Link to="/admin/products" className="btn btn-secondary">
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