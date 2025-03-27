import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { DeleteCartDto } from './dto/delete-cart.dto';

type CartItem = {
  CustomerID: number;
  ProductTypeID: number;
  Quantity: number;
  CreateAt: Date;
  UpdateAt: Date;
  ProductID: number;
  Type_1: string;
  Type_2: string;
  Image: string;
  Price: number;
  ProductQuantity: number;
  SellerID: number;
  ShopName: string;
  ProductName: string;
};

type ProductDetail = {
  type_id: string;
  type_1: string;
  type_2: string;
  image: string;
  price: number;
  quantity: number;
};

type GroupedCart = {
  shopName: string;
  sellerId: number;
  items: {
    productId: number;
    productTypeId: number;
    type1: string;
    type2: string;
    image: string;
    price: number;
    quantity: number;
    availableQuantity: number;
    details: ProductDetail[];
  }[];
};

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async addToCart(createCartDto: CreateCartDto) {
    const cart = await this.cartRepository.findOne({
      where: {
        customerId: createCartDto.customerId,
        productTypeId: createCartDto.productTypeId,
      },
    });
    if (cart) {
      cart.quantity += createCartDto.quantity;
      cart.updatedAt = new Date();
      return this.cartRepository.save(cart);
    } else {
      const newCart = this.cartRepository.create({
        ...createCartDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return this.cartRepository.save(newCart);
    }
  }

  async updateCart(updateCartDto: UpdateCartDto) {
    const cart = await this.cartRepository.findOne({
      where: {
        customerId: updateCartDto.customerId,
        productTypeId: updateCartDto.productTypeId,
      },
    });
    if (cart) {
      cart.quantity = updateCartDto.quantity;
      cart.updatedAt = new Date();
      return this.cartRepository.save(cart);
    } else {
      return { message: 'Item not found in cart' };
    }
  }

  async deleteFromCart(deleteCartDto: DeleteCartDto) {
    const item = await this.cartRepository.findOne({
      where: {
        customerId: deleteCartDto.customerId,
        productTypeId: deleteCartDto.productTypeId,
      },
    });
    if (item) {
      return this.cartRepository.delete({
        customerId: item.customerId,
        productTypeId: item.productTypeId,
      });
    } else {
      return { message: 'Item not found in cart' };
    }
  }

  async getCart(customerId: number) {
    const cartItems = await this.cartRepository.query(
      `
        SELECT 
            c."CustomerID",
            c."ProductTypeID",
            c."Quantity",
            c."CreateAt",
            c."UpdateAt",
            p."ProductID",
            p."Type_1",
            p."Type_2",
            p."Image",
            p."Price",
            p."Quantity" as "ProductQuantity",
            pro."SellerID",
            pro."Name" as "ProductName",
            s."ShopName"
        FROM public."Carts" c
        JOIN public."ProductDetailType" p 
            ON c."ProductTypeID" = p."ProductDetailTypeID"
        JOIN public."Products" pro
            ON p."ProductID" = pro."ProductID"
        JOIN public."Sellers" s
            ON pro."SellerID" = s."id"
        WHERE c."CustomerID" = $1
    `,
      [customerId],
    );

    // console.log(cartItems);

    const productDetails = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const response = await axios.get(
            `http://34.58.241.34:3001/product/classifications/${item.ProductID}`,
          );
          // console.log(response.data.details);
          return response.data.details || [];
        } catch (error) {
          console.error('Error fetching product detail:', error);
          return null;
        }
      }),
    );

    // Group items by shop
    const groupedByShop = cartItems.reduce(
      (acc: GroupedCart[], item: CartItem, index: number) => {
        const shopIndex = acc.findIndex(
          (shop) => shop.sellerId === item.SellerID,
        );

        const cartItem = {
          productId: item.ProductID,
          productName: item.ProductName,
          productTypeId: item.ProductTypeID,
          type1: item.Type_1,
          type2: item.Type_2,
          image: item.Image,
          price: item.Price,
          quantity: item.Quantity,
          availableQuantity: item.ProductQuantity,
          details: productDetails[index].map((d) => ({
            type_id: d.type_id,
            type_1: d.type_1,
            type_2: d.type_2,
            image: d.image,
            price: d.price,
            quantity: d.quantity,
          })),
        };

        // console.log(cartItem.details);

        if (shopIndex === -1) {
          // Add new shop group
          acc.push({
            shopName: item.ShopName,
            sellerId: item.SellerID,
            items: [cartItem],
          });
        } else {
          // Add item to existing shop group
          acc[shopIndex].items.push(cartItem);
        }
        return acc;
      },
      [],
    );
    return groupedByShop;
  }

  async deleteAllCart(customerId: number) {
    try {
      const msg = await this.cartRepository.query(
        `DELETE FROM "Carts" WHERE "CustomerID" = ${customerId};`,
      );
    } catch (error) {
      throw new BadRequestException('Something bad happened', {
        cause: new Error(),
        description: `${error.message}`,
      });
    }
  }

  create(createCartDto: CreateCartDto) {
    return 'This action adds a new cart';
  }

  findAll() {
    return `This action returns all carts test`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
