import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentStatus } from '../../common/enums';

export class UpdateOrderPaymentStatusDto {
  @IsNotEmpty()
  @IsEnum(PaymentStatus, { message: 'Invalid payment status provided.' })
  status: PaymentStatus; // Expecting 'Paid' or 'Failed'
}