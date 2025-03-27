import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { DeleteCartDto } from './dto/delete-cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('/add-to-cart')
  addToCart(@Body() createCartDto: CreateCartDto) {
    return this.cartsService.addToCart(createCartDto);
  }

  @Post('/delete-from-cart')
  deleteFromCart(@Body() deleteCartDto: DeleteCartDto) {
    return this.cartsService.deleteFromCart(deleteCartDto);
  }

  @Get('/delete-all-cart/:customerId')
  deletedAllCart(@Param('customerId') customerId: string) {
    return this.cartsService.deleteAllCart(+customerId);
  }

  @Post('/update-cart')
  updateCart(@Body() updateCartDto: UpdateCartDto) {
    return this.cartsService.updateCart(updateCartDto);
  }

  @Get(':customerId')
  getCart(@Param('customerId') customerId: string) {
    return this.cartsService.getCart(+customerId);
  }

  // auto generate
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartsService.findOne(+id);
  }

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartsService.addToCart(createCartDto);
  }

  @Get()
  findAll() {
    return this.cartsService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartsService.update(+id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartsService.remove(+id);
  }
}
