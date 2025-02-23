import { Get, Post, Body, Controller, Req} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { ApiBody } from '@nestjs/swagger';

@Controller('api')
export class ApigatewayController {
  constructor(private readonly httpService: HttpService) {}

  @Get('hello')
  async getHello() {
    return "Hello from API Gateway!";
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
          example: "query { hello { message } }",
        },
      },
    },
  })
  @Post()
  async forwardGraphqlRequest(@Req() req: Request, @Body() body: any): Promise<any> {
    const graphqlServiceUrl = 'http://localhost:3103/graphql';

    const response = await firstValueFrom(
      this.httpService.post(graphqlServiceUrl, body, {
        headers: req.headers, 
      }),
    );
    return response.data;
  }
 
}
