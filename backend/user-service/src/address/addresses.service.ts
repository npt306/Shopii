import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepository.create(createAddressDto);
    return this.addressRepository.save(address);
  }


  async createAddressForAccount(accountId: number, createAddressDto: CreateAddressDto): Promise<Address> {
    // Ensure the DTO has the correct account id
    createAddressDto.AccountId = accountId;
    const address = this.addressRepository.create(createAddressDto);
    return this.addressRepository.save(address);
  }

  async getAllAddresses(): Promise<any[]> {
    console.log('Getting all addresses');
    const addresses = await this.addressRepository
      .createQueryBuilder('address')
      .orderBy('address.CreatedAt', 'DESC') // Order by creation date
      .getMany();

    const addressList = addresses.map((address) => ({
      id: address.AddressId,
      fullName: address.FullName,
      phoneNumber: address.PhoneNumber,
      province: address.Province,
      district: address.District,
      ward: address.Ward,
      specificAddress: address.SpecificAddress,
      createdAt: address.CreatedAt,
      updatedAt: address.UpdatedAt,
      accountId: address.AccountId,
      isDefault: address.isDefault,
      isShipping: address.isDefault,
      isDelivery: address.isDefault,
    }));

    return addressList;
  }
  async getAddressesByAccount(accountId: number): Promise<any[]> {
    console.log(`Getting addresses for accountId: ${accountId}`);
    const addresses = await this.addressRepository
      .createQueryBuilder('address')
      .where('address.AccountId = :accountId', { accountId })
      .orderBy('address.CreatedAt', 'DESC')
      .getMany();

    console.log(`Found ${addresses.length} addresses for accountId: ${accountId}`);

    return addresses.map((address) => ({
      id: address.AddressId,
      fullName: address.FullName,
      phoneNumber: address.PhoneNumber,
      province: address.Province,
      district: address.District,
      ward: address.Ward,
      specificAddress: address.SpecificAddress,
      createdAt: address.CreatedAt,
      updatedAt: address.UpdatedAt,
      accountId: address.AccountId,
      isDefault: address.isDefault,
      isShipping: address.isDefault,
      isDelivery: address.isDefault,
    }));
  }

  async getAddressesByDefaultAccount(accountId: number): Promise<any> {
    console.log(`Getting default address for accountId: ${accountId}`);
    
    const address = await this.addressRepository
      .createQueryBuilder('address')
      .where({ AccountId: accountId, isDefault: true })
      .orderBy('address.CreatedAt', 'DESC')
      .getOne(); // Use getOne() to fetch a single record
  
    if (!address) {
      console.log(`No default address found for accountId: ${accountId}`);
      return null; // Return null if no default address is found
    }
  
    console.log(`Found default address for accountId: ${accountId}`);
  
    return {
      id: address.AddressId,
      fullName: address.FullName,
      phoneNumber: address.PhoneNumber,
      province: address.Province,
      district: address.District,
      ward: address.Ward,
      specificAddress: address.SpecificAddress,
      createdAt: address.CreatedAt,
      updatedAt: address.UpdatedAt,
      accountId: address.AccountId,
      isDefault: address.isDefault,
      isShipping: address.isShipping,
      isDelivery: address.isDelivery,
    };
  }






  async findAll(): Promise<Address[]> {
    console.log(`This action returns all address`);
    return this.addressRepository.find();
  }
  async removeById(id: number): Promise<void> {
    await this.addressRepository.delete({ AddressId: id });
  }

  async update(id: number, updateAddressDto: UpdateAddressDto){
    console.log(`This action update address by addressId`);
    await this.addressRepository.update({ AddressId: id }, updateAddressDto);
    return this.addressRepository.findOneBy({ AddressId: id });
  }
  async setDefaultAddress(id: number, accountId: number): Promise<void> {
    await this.addressRepository.manager.transaction(async (transactionalEntityManager) => {
      // First, set isDefault to false for all addresses of this account
      await transactionalEntityManager
        .createQueryBuilder(Address, 'address')
        .update(Address)
        .set({ isDefault: false })
        .where({ AccountId: accountId }) // Use object syntax for the where clause
        .execute();
  
      // Then, set isDefault to true for the selected address
      await transactionalEntityManager
        .createQueryBuilder(Address, 'address')
        .update(Address)
        .set({ isDefault: true })
        .where({ AddressId: id, AccountId: accountId }) // Use object syntax for the where clause
        .execute();
    });
  }
  async setDeliveryAddress(id: number, accountId: number): Promise<void> {
    await this.addressRepository.manager.transaction(async (transactionalEntityManager) => {
      // First, set isDelivery to false for all addresses of this account
      await transactionalEntityManager
        .createQueryBuilder(Address, 'address')
        .update(Address)
        .set({ isDelivery: false })
        .where({ AccountId: accountId }) // Use object syntax for the where clause
        .execute();
  
      // Then, set isDelivery to true for the selected address
      await transactionalEntityManager
        .createQueryBuilder(Address, 'address')
        .update(Address)
        .set({ isDelivery: true })
        .where({ AddressId: id, AccountId: accountId }) // Use object syntax for the where clause
        .execute();
    });
  }
  
  async setShippingAddress(id: number, accountId: number): Promise<void> {
    await this.addressRepository.manager.transaction(async (transactionalEntityManager) => {
      // First, set isShipping to false for all addresses of this account
      await transactionalEntityManager
        .createQueryBuilder(Address, 'address')
        .update(Address)
        .set({ isShipping: false })
        .where({ AccountId: accountId }) // Use object syntax for the where clause
        .execute();
  
      // Then, set isShipping to true for the selected address
      await transactionalEntityManager
        .createQueryBuilder(Address, 'address')
        .update(Address)
        .set({ isShipping: true })
        .where({ AddressId: id, AccountId: accountId }) // Use object syntax for the where clause
        .execute();
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} address`;
  }
}