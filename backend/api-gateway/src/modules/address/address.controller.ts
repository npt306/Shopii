import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('api/address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}
  // Get addresses by account ID
  @Get('account/:accountId')
  async getAddressesByAccount(@Param('accountId') accountId: number) {
    return this.addressService.getAddressesByAccount(accountId);
  }
  
  @Get('account/default/:accountId')
  async getDefaultAddress(@Param('accountId') accountId: number) {
    return this.addressService.getDefaultAddress(accountId);
  }
  @Post('update/:id')
  updateByPost(
    @Param('id') id: string,
    @Body() updateAddressDto: any,
  ) {
    return this.addressService.update(+id, updateAddressDto);
  }

  @Post('account/:accountId')
  async createAddress(
    @Param('accountId') accountId: number,
    @Body() createAddressDto: any,
  ) {
    return this.addressService.createAddress(accountId, createAddressDto);
  }

  @Post(':id/set-default/:accountId')
  async setDefaultAddress(
    @Param('id') addressId: number,
    @Param('accountId') accountId: number,
  ) {
    return this.addressService.setDefaultAddress(addressId, accountId);
  }

  @Post(':id/set-shipping/:accountId')
  async setShippingAddress(
    @Param('id') addressId: number,
    @Param('accountId') accountId: number,
  ) {
    return this.addressService.setShippingAddress(addressId, accountId);
  }

  @Post(':id/set-delivery/:accountId')
  async setDeliveryAddress(
    @Param('id') addressId: number,
    @Param('accountId') accountId: number,
  ) {
    return this.addressService.setDeliveryAddress(addressId, accountId);
  }

  @Delete(':id')
  async deleteAddress(@Param('id') addressId: number) {
    return this.addressService.deleteAddress(addressId);
  }
}