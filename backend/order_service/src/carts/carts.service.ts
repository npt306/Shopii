import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { DeleteCartDto } from './dto/delete-cart.dto';

interface CartItem {
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
}

interface GroupedCart {
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
  }[];
}

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) { }

  async addToCart(createCartDto: CreateCartDto) {
    const cart = await this.cartRepository.findOne({
      where: {
        customerId: createCartDto.customerId,
        productTypeId: createCartDto.productTypeId
      }
    });
    if (cart) {
      cart.quantity += createCartDto.quantity;
      cart.updatedAt = new Date();
      return this.cartRepository.save(cart);
    } else {
      const newCart = this.cartRepository.create({
        ...createCartDto,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return this.cartRepository.save(newCart);
    }
  }

  async updateCart(updateCartDto: UpdateCartDto) {
    const cart = await this.cartRepository.findOne({
      where: {
        customerId: updateCartDto.customerId,
        productTypeId: updateCartDto.productTypeId
      }
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
    const cart = await this.cartRepository.findOne({
      where: {
        customerId: deleteCartDto.customerId,
        productTypeId: deleteCartDto.productTypeId
      }
    });
    if (cart) {
      return this.cartRepository.delete({
        customerId: cart.customerId,
        productTypeId: cart.productTypeId
      });
    } else {
      return { message: 'Item not found in cart' };
    }
  }

  async getCart(customerId: number) {
    const cartItems = await this.cartRepository.query(`
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
            s."ShopName"
        FROM public."Carts" c
        JOIN public."ProductDetailType" p 
            ON c."ProductTypeID" = p."ProductDetailTypeID"
        JOIN public."Products" pro
            ON p."ProductID" = pro."ProductID"
        JOIN public."Sellers" s
            ON pro."SellerID" = s."id"
        WHERE c."CustomerID" = $1
    `, [customerId]);

    // Group items by shop
    const groupedByShop = cartItems.reduce((acc: GroupedCart[], item: CartItem) => {
      const shopIndex = acc.findIndex(shop => shop.sellerId === item.SellerID);

      const cartItem = {
        productId: item.ProductID,
        productTypeId: item.ProductTypeID,
        type1: item.Type_1,
        type2: item.Type_2,
        image: item.Image,
        price: item.Price,
        quantity: item.Quantity,
        availableQuantity: item.ProductQuantity
      };

      if (shopIndex === -1) {
        // Add new shop group
        acc.push({
          shopName: item.ShopName,
          sellerId: item.SellerID,
          items: [cartItem]
        });
      } else {
        // Add item to existing shop group
        acc[shopIndex].items.push(cartItem);
      }
      return acc;
    }, []);
    return groupedByShop;
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
