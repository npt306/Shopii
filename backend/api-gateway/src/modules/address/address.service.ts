import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; // Import HttpService from @nestjs/axios
import { lastValueFrom } from 'rxjs'; // Use lastValueFrom to handle observables

@Injectable()
export class AddressService {
  constructor(private readonly httpService: HttpService) {}

  async getAddressesByAccount(accountId: number): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.get(`/address/account/${accountId}`)
    );
    return response.data;
  }

  async getDefaultAddress(accountId: number): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.get(`/address/account/default/${accountId}`)
    );
    return response.data;
  }

  async createAddress(accountId: number, createAddressDto: any): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(`/address/account/${accountId}`,
        createAddressDto
      )
    );
    return response.data;
  }

  async update(addressId: number, updateAddressDto: any): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(`/address/update/${addressId}`,
        updateAddressDto
      )
    );
    return response.data;
  }


  async setDefaultAddress(addressId: number, accountId: number): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(
        `/address/${addressId}/set-default/${accountId}`
      )
    );
    return response.data;
  }

  async setShippingAddress(addressId: number, accountId: number): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(
        `/address/${addressId}/set-shipping/${accountId}`
      )
    );
    return response.data;
  }

  async setDeliveryAddress(addressId: number, accountId: number): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(
        `/address/${addressId}/set-delivery/${accountId}`
      )
    );
    return response.data;
  }

  async deleteAddress(addressId: number): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.delete(`/address/${addressId}`)
    );
    return response.data;
  }
}