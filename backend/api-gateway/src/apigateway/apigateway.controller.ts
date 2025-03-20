import {
  Get,
  Post,
  Body,
  Controller,
  Req,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { ApiBody } from '@nestjs/swagger';

@Controller('api')
export class ApigatewayController {
  constructor(private readonly httpService: HttpService) {}

  @Get('hello')
  getHello() {
    return 'Hello from API Gateway!';
  }

  @Get('rest/hello')
  async getRestHello(@Req() req): Promise<any> {
    const testServiceUrl = 'http://localhost:3101/rest/hello';
    const response = await firstValueFrom(this.httpService.get(testServiceUrl));
    return response.data;
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          example: 'query { hello { message } }',
        },
      },
    },
  })
  @Post()
  async forwardGraphqlRequest(
    @Req() req: Request,
    @Body() body: any,
  ): Promise<any> {
    const graphqlServiceUrl = 'http://localhost:3103/graphql';

    const response = await firstValueFrom(
      this.httpService.post(graphqlServiceUrl, body, {
        headers: req.headers,
      }),
    );
    return response.data;
  }
  // Voucher Service
  @Post('vouchers')
  async createVoucher(@Body() createVoucherDto: any): Promise<any> {
    const voucherServiceUrl = 'http://localhost:3002/vouchers';
    const response = await firstValueFrom(
      this.httpService.post(voucherServiceUrl, createVoucherDto),
    );
    return response.data;
  }

  @Get('vouchers')
  async getAllVouchers(): Promise<any> {
    const voucherServiceUrl = 'http://localhost:3002/vouchers';
    const response = await firstValueFrom(
      this.httpService.get(voucherServiceUrl),
    );
    return response.data;
  }

  @Get('vouchers/:id')
  async getVoucherById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    const voucherServiceUrl = `http://localhost:3002/vouchers/${id}`;
    const response = await firstValueFrom(
      this.httpService.get(voucherServiceUrl),
    );
    return response.data;
  }

  @Patch('vouchers/:id')
  async updateVoucher(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVoucherDto: any,
  ): Promise<any> {
    const voucherServiceUrl = `http://localhost:3002/vouchers/${id}`;
    const response = await firstValueFrom(
      this.httpService.patch(voucherServiceUrl, updateVoucherDto),
    );
    return response.data;
  }

  @Delete('vouchers/:id')
  async deleteVoucher(@Param('id', ParseIntPipe) id: number): Promise<any> {
    const voucherServiceUrl = `http://localhost:3002/vouchers/${id}`;
    const response = await firstValueFrom(
      this.httpService.delete(voucherServiceUrl),
    );
    return response.data;
  }
}
