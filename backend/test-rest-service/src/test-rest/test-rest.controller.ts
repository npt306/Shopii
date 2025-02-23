import { Get, Controller } from '@nestjs/common';

@Controller('rest')
export class TestRestController {
    @Get('hello')
    getHello(): string {
        return 'Hello from REST Service';
    }
}
