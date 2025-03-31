export enum OrderStatus {
    PENDING_PAYMENT = 'Pending Payment',
    PROCESSING = 'Processing',
    SHIPPED = 'Shipped',
    DELIVERED = 'Delivered',
    CANCELLED = 'Cancelled',
    RETURN_REQUESTED = 'Return Requested',
    RETURNED = 'Returned',
    FAILED_DELIVERY = 'Failed Delivery',
}

export enum PaymentStatus {
    PENDING = 'Pending',
    PAID = 'Paid',
    FAILED = 'Failed',
    REFUNDED = 'Refunded',
}

export enum PaymentMethod {
    COD = 'Cash on Delivery',
    VNPAY = 'VNPay',
}

// Interface for an order item within an order
export interface OrderItemDetail {
    id: number;
    productId: number;
    productTypeId: number;
    productName: string;
    variation1?: string;
    variation2?: string;
    quantity: number;
    priceAtTime: number;
    productImage?: string;
}

// Interface for the full order details
export interface OrderDetail {
    id: number;
    customerId: number;
    shippingAddress: string;
    totalAmount: number;
    shippingFee: number;
    discountAmount: number;
    voucherCode?: string;
    orderStatus: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    notes?: string;
    items: OrderItemDetail[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    productId: number;
    productTypeId: number;
    productName: string;
    variation1?: string;
    variation2?: string;
    quantity: number;
    priceAtTime: number;
    productImage: string;
}

export interface OrderRequest {
    customerId: number;
    shippingAddress: string;
    paymentMethod: PaymentMethod;
    items: OrderItem[];
    totalAmount: number;
    shippingFee: number;
    discountAmount: number;
    voucherCode?: string;
    notes?: string;
}