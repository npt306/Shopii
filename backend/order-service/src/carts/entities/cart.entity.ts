import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Carts' })
export class Cart {
  @PrimaryColumn({ name: 'CustomerID', type: 'int' })
  customerId: number;

  @PrimaryColumn({ name: 'ProductTypeID', type: 'int' })
  productTypeId: number;

  @Column({ name: 'Quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'CreateAt' })
  createdAt: Date;

  @Column({ name: 'UpdateAt' })
  updatedAt: Date;

  @Column({ name: 'ProductID' })
  productId: number;
}
