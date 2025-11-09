import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserInternalIdProvider } from './get-user-internal-id.provider';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';

// Mock the schema to avoid ES module issues
jest.mock('../../../db/schema', () => ({
  users: {
    id: 'id',
    clerkUserId: 'clerk_user_id',
    email: 'email',
    name: 'name'
  },
}));

describe('GetUserInternalIdProvider', () => {
  let provider: GetUserInternalIdProvider;
  let mockDb: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    // Mock the query builder chain
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    };

    mockDb = {
      select: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserInternalIdProvider,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockDb,
        },
      ],
    }).compile();

    provider = module.get<GetUserInternalIdProvider>(GetUserInternalIdProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('execute', () => {
    it('should return user internal ID when user exists', async () => {
      const mockUser = [{ id: 'user-uuid' }];
      mockQueryBuilder.limit.mockResolvedValue(mockUser);

      const result = await provider.execute('clerk-user-id');

      expect(result).toBe('user-uuid');
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockQueryBuilder.limit.mockResolvedValue([]);

      await expect(provider.execute('nonexistent-user')).rejects.toThrow(NotFoundException);
      await expect(provider.execute('nonexistent-user')).rejects.toThrow('User not found');
    });
  });
});