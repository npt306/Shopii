export enum OrderStatus {
    PENDING_PAYMENT = 'Pending Payment', // Waiting for payment confirmation
    PROCESSING = 'Processing',         // Payment confirmed, seller preparing order
    SHIPPED = 'Shipped',               // Order handed over to shipper
    DELIVERED = 'Delivered',           // Order received by buyer
    CANCELLED = 'Cancelled',           // Order cancelled by buyer or seller
    RETURN_REQUESTED = 'Return Requested', // Buyer requested return/refund
    RETURNED = 'Returned',             // Order returned
    FAILED_DELIVERY = 'Failed Delivery', // Delivery attempt failed
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
    // Add other methods like Card, Wallet later
  }