import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { DRIZZLE_ASYNC_PROVIDER } from '../db/providers/drizzle.provider';

// Mock the entire db/schema module to avoid ES module issues
jest.mock('../db/schema', () => ({
  users: {
    id: 'id',
    clerkUserId: 'clerk_user_id',
    email: 'email',
    name: 'name'
  },
  projects: {
    id: 'id',
    userId: 'user_id'
  }
}));

describe('UserService', () => {
  let service: UserService;
  let mockDb: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    // Mock the query builder chain
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]), // Default to empty array
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    mockDb = {
      select: jest.fn().mockReturnValue(mockQueryBuilder),
      insert: jest.fn().mockReturnValue(mockQueryBuilder),
      update: jest.fn().mockReturnValue(mockQueryBuilder),
      delete: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    // Spy on the database methods we want to track
    jest.spyOn(mockDb, 'insert');
    jest.spyOn(mockDb, 'update');
    jest.spyOn(mockQueryBuilder, 'values');
    jest.spyOn(mockQueryBuilder, 'set');
    jest.spyOn(mockQueryBuilder, 'returning');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset the returning mock to default
    mockQueryBuilder.returning.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserInternalId', () => {
    it('should return user internal ID when user exists', async () => {
      const mockUser = [{ id: 'user-uuid' }];
      mockQueryBuilder.limit.mockResolvedValue(mockUser);

      const result = await service.getUserInternalId('clerk-user-id');

      expect(result).toBe('user-uuid');
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockQueryBuilder.limit.mockResolvedValue([]);

      await expect(service.getUserInternalId('nonexistent-user')).rejects.toThrow(NotFoundException);
      await expect(service.getUserInternalId('nonexistent-user')).rejects.toThrow('User not found');
    });
  });

  describe('getUserByClerkId', () => {
    it('should return full user when user exists', async () => {
      const mockUser = [
        {
          id: 'user-uuid',
          clerkUserId: 'clerk-user-id',
          email: 'test@example.com',
          name: 'Test User',
          plan: 'free',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      mockQueryBuilder.limit.mockResolvedValue(mockUser);

      const result = await service.getUserByClerkId('clerk-user-id');

      expect(result).toEqual(mockUser[0]);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockQueryBuilder.limit.mockResolvedValue([]);

      await expect(service.getUserByClerkId('nonexistent-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserProjectIds', () => {
    it('should return array of project IDs', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project 1' },
        { id: 'project-2', name: 'Project 2' }
      ];
      mockQueryBuilder.limit.mockResolvedValue([{ id: 'user-uuid' }]);
      mockQueryBuilder.orderBy.mockResolvedValue(mockProjects);

      const result = await service.getUserProjectIds('clerk-user-id');

      expect(result).toEqual(['project-1', 'project-2']);
    });

    it('should return empty array when user has no projects', async () => {
      mockQueryBuilder.limit.mockResolvedValue([{ id: 'user-uuid' }]);
      mockQueryBuilder.orderBy.mockResolvedValue([]);

      const result = await service.getUserProjectIds('clerk-user-id');

      expect(result).toEqual([]);
    });
  });

  describe('ownsProject', () => {
    it('should return true when user owns the project', async () => {
      mockQueryBuilder.limit
        .mockResolvedValueOnce([{ id: 'user-uuid' }]) // getUserInternalId
        .mockResolvedValueOnce([{ id: 'project-uuid' }]); // project ownership check

      const result = await service.ownsProject('clerk-user-id', 'project-uuid');

      expect(result).toBe(true);
    });

    it('should return false when user does not own the project', async () => {
      mockQueryBuilder.limit
        .mockResolvedValueOnce([{ id: 'user-uuid' }]) // getUserInternalId
        .mockResolvedValueOnce([]); // no project found

      const result = await service.ownsProject('clerk-user-id', 'project-uuid');

      expect(result).toBe(false);
    });
  });

  describe('upsertUserFromClerk', () => {
    const mockClerkUser = {
      id: 'clerk-user-id',
      email_addresses: [{ email_address: 'test@example.com' }],
      first_name: 'Test',
      last_name: 'User'
    };

    it('should create new user when user does not exist', async () => {
      const mockNewUser = {
        id: 'user-uuid',
        clerkUserId: 'clerk-user-id',
        email: 'test@example.com',
        name: 'Test User'
      };

      // Mock user lookup (not found) and insert operation
      mockQueryBuilder.limit.mockResolvedValueOnce([]); // user not found
      mockQueryBuilder.returning.mockResolvedValueOnce([mockNewUser]); // created user

      const result = await service.upsertUserFromClerk(mockClerkUser);

      expect(result).toEqual(mockNewUser);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockQueryBuilder.values).toHaveBeenCalledWith({
        clerkUserId: 'clerk-user-id',
        email: 'test@example.com',
        name: 'Test User'
      });
    });

    it('should update existing user when user exists', async () => {
      const mockExistingUser = {
        id: 'user-uuid',
        clerkUserId: 'clerk-user-id',
        email: 'old@example.com',
        name: 'Old Name'
      };

      const mockUpdatedUser = {
        ...mockExistingUser,
        email: 'test@example.com',
        name: 'Test User'
      };

      // Mock user lookup (found) and update operation
      mockQueryBuilder.limit.mockResolvedValueOnce([mockExistingUser]); // user found
      mockQueryBuilder.returning.mockResolvedValueOnce([mockUpdatedUser]); // updated user

      const result = await service.upsertUserFromClerk(mockClerkUser);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user and associated data', async () => {
      mockQueryBuilder.limit.mockResolvedValue([{ id: 'user-uuid' }]);

      await service.deleteUser('clerk-user-id');

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockQueryBuilder.limit.mockResolvedValue([]);

      await expect(service.deleteUser('nonexistent-user')).rejects.toThrow(NotFoundException);
    });
  });
});