import { Min } from 'class-validator';

export class UpdateCartDto { 
    customerId: number;
    productTypeId: number;

    @Min(1)
    quantity: number;
}
