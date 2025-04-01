import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AddressService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(createAddressDto);
  }

  @Get()
  findAll() {
    return this.addressService.findAll();
  }
   @Get()
    async getAllAddresses(): Promise<Address[]> {
      console.log("Get all addresses");
      return this.addressService.getAllAddresses();
    }
  @Get('account/:accountId')
  async getAddressesByAccount(@Param('accountId') accountId: string): Promise<Address[]> {
    return this.addressService.getAddressesByAccount(+accountId);
  }
  @Post('account/:accountId')
  createAddressForAccount(@Param('accountId') accountId: string, @Body() createAddressDto: CreateAddressDto) {
    return this.addressService.createAddressForAccount(+accountId, createAddressDto);
  }
  @Post(':id/set-default/:accountId')
  async setDefaultAddress(
    @Param('id') addressId: string,
    @Param('accountId') accountId: string
  ) {
    await this.addressService.setDefaultAddress(+addressId, +accountId);
    return { message: 'Default address updated successfully' };
  }


  @Post(':id/set-delivery/:accountId')
  async setDeliveryAddress(
    @Param('id') addressId: string,
    @Param('accountId') accountId: string
  ) {
    await this.addressService.setDeliveryAddress(+addressId, +accountId);
    return { message: 'Delivery address updated successfully' };
  }

  @Post(':id/set-shipping/:accountId')
  async setShippingAddress(
    @Param('id') addressId: string,
    @Param('accountId') accountId: string
  ) {
    await this.addressService.setShippingAddress(+addressId, +accountId);
    return { message: 'Shipping address updated successfully' };
  }
  

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(+id);
  }

  @Post('update/:id')
  updateByPost(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(+id, updateAddressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressService.removeById(+id);
  }
}
