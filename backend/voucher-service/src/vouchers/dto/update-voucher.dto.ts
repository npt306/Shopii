import {
    IsString,
    IsOptional,
    IsInt,
    Min,
    Max,
    IsDateString,
    IsEnum,
    ValidateIf,
    IsArray,
    ArrayMinSize,
  } from 'class-validator';
  import { VoucherConditionType } from '../../common/enums/voucher-condition-type.enum';
  import { VoucherActionType } from '../../common/enums/voucher-action-type.enum';
  import { PartialType } from '@nestjs/mapped-types';
  import { CreateVoucherDto } from './create-voucher.dto';
  
  export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {}