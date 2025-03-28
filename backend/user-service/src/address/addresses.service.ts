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
    }));
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

  findOne(id: number) {
    return `This action returns a #${id} address`;
  }


  
}