import { Min } from 'class-validator';

export class UpdateCartDto {
  customerId: number;
  productId: number;
  productTypeId: number;

  @Min(1)
  quantity: number;
}
