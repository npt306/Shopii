import { Test, TestingModule } from '@nestjs/testing';
import { AccountManagementController } from './accounts-management.controller';

describe('AccountManagementController', () => {
  let controller: AccountManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountManagementController],
    }).compile();

    controller = module.get<AccountManagementController>(AccountManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
