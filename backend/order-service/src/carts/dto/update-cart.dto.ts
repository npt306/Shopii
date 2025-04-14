import { Min } from 'class-validator';

export class UpdateCartDto {
  id: number;
  productId: number;
  productTypeId: number;

  @Min(1)
  quantity: number;
}
