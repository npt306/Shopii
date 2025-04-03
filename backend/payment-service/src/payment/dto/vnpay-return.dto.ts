import { IsString, IsOptional, IsNumberString } from 'class-validator';

export class VnpayReturnDto {
  @IsString()
  vnp_TmnCode: string;

  @IsNumberString()
  vnp_Amount: string;

  @IsString()
  vnp_BankCode: string;

  @IsOptional()
  @IsString()
  vnp_BankTranNo?: string;

  @IsOptional()
  @IsString()
  vnp_CardType?: string;

  @IsNumberString()
  vnp_PayDate: string;

  @IsString()
  vnp_OrderInfo: string;

  @IsNumberString()
  vnp_TransactionNo: string;

  @IsString()
  vnp_ResponseCode: string;

  @IsString()
  vnp_TransactionStatus: string;

  @IsString()
  vnp_TxnRef: string;

  @IsString()
  vnp_SecureHashType: string;

  @IsString()
  vnp_SecureHash: string;
}
