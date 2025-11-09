import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import {
  GET_USER_INTERNAL_ID,
  GET_USER_BY_CLERK_ID,
  GET_USER_PROJECTS,
  CHECK_PROJECT_OWNERSHIP,
  UPSERT_USER_FROM_CLERK,
  DELETE_USER
} from './providers/tokens';

describe('UserService', () => {
  let service: UserService;
  let mockGetUserInternalIdProvider: jest.MockedFunction<any>;
  let mockGetUserByClerkIdProvider: jest.MockedFunction<any>;
  let mockGetUserProjectsProvider: jest.MockedFunction<any>;
  let mockCheckProjectOwnershipProvider: jest.MockedFunction<any>;
  let mockUpsertUserFromClerkProvider: jest.MockedFunction<any>;
  let mockDeleteUserProvider: jest.MockedFunction<any>;

  beforeEach(async () => {
    // Create mock provider functions
    mockGetUserInternalIdProvider = jest.fn();
    mockGetUserByClerkIdProvider = jest.fn();
    mockGetUserProjectsProvider = jest.fn();
    mockCheckProjectOwnershipProvider = jest.fn();
    mockUpsertUserFromClerkProvider = jest.fn();
    mockDeleteUserProvider = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: GET_USER_INTERNAL_ID,
          useValue: {
            execute: mockGetUserInternalIdProvider
          }
        },
        {
          provide: GET_USER_BY_CLERK_ID,
          useValue: {
            execute: mockGetUserByClerkIdProvider
          }
        },
        {
          provide: GET_USER_PROJECTS,
          useValue: {
            execute: mockGetUserProjectsProvider
          }
        },
        {
          provide: CHECK_PROJECT_OWNERSHIP,
          useValue: {
            execute: mockCheckProjectOwnershipProvider
          }
        },
        {
          provide: UPSERT_USER_FROM_CLERK,
          useValue: {
            execute: mockUpsertUserFromClerkProvider
          }
        },
        {
          provide: DELETE_USER,
          useValue: {
            execute: mockDeleteUserProvider
          }
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserInternalId', () => {
    it('should return user internal ID when user exists', async () => {
      mockGetUserInternalIdProvider.mockResolvedValue('user-uuid');

      const result = await service.getUserInternalId('clerk-user-id');

      expect(result).toBe('user-uuid');
      expect(mockGetUserInternalIdProvider).toHaveBeenCalledWith('clerk-user-id');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockGetUserInternalIdProvider.mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.getUserInternalId('nonexistent-user')).rejects.toThrow(NotFoundException);
      await expect(service.getUserInternalId('nonexistent-user')).rejects.toThrow('User not found');
      expect(mockGetUserInternalIdProvider).toHaveBeenCalledWith('nonexistent-user');
    });
  });

  describe('getUserByClerkId', () => {
    it('should return full user when user exists', async () => {
      const mockUser = {
        id: 'user-uuid',
        clerkUserId: 'clerk-user-id',
        email: 'test@example.com',
        name: 'Test User'
      };
      mockGetUserByClerkIdProvider.mockResolvedValue(mockUser);

      const result = await service.getUserByClerkId('clerk-user-id');

      expect(result).toEqual(mockUser);
      expect(mockGetUserByClerkIdProvider).toHaveBeenCalledWith('clerk-user-id');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockGetUserByClerkIdProvider.mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.getUserByClerkId('nonexistent-user')).rejects.toThrow(NotFoundException);
      expect(mockGetUserByClerkIdProvider).toHaveBeenCalledWith('nonexistent-user');
    });
  });

  describe('getUserProjects', () => {
    it('should return user projects', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project 1' },
        { id: 'project-2', name: 'Project 2' }
      ];
      mockGetUserInternalIdProvider.mockResolvedValue('user-uuid');
      mockGetUserProjectsProvider.mockResolvedValue(mockProjects);

      const result = await service.getUserProjects('clerk-user-id');

      expect(result).toEqual(mockProjects);
      expect(mockGetUserInternalIdProvider).toHaveBeenCalledWith('clerk-user-id');
      expect(mockGetUserProjectsProvider).toHaveBeenCalledWith('user-uuid');
    });

    it('should return empty array when user has no projects', async () => {
      mockGetUserInternalIdProvider.mockResolvedValue('user-uuid');
      mockGetUserProjectsProvider.mockResolvedValue([]);

      const result = await service.getUserProjects('clerk-user-id');

      expect(result).toEqual([]);
    });
  });

  describe('getUserProjectIds', () => {
    it('should return project IDs array', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project 1' },
        { id: 'project-2', name: 'Project 2' }
      ];
      mockGetUserInternalIdProvider.mockResolvedValue('user-uuid');
      mockGetUserProjectsProvider.mockResolvedValue(mockProjects);

      const result = await service.getUserProjectIds('clerk-user-id');

      expect(result).toEqual(['project-1', 'project-2']);
    });

    it('should return empty array when user has no projects', async () => {
      mockGetUserInternalIdProvider.mockResolvedValue('user-uuid');
      mockGetUserProjectsProvider.mockResolvedValue([]);

      const result = await service.getUserProjectIds('clerk-user-id');

      expect(result).toEqual([]);
    });
  });

  describe('ownsProject', () => {
    it('should return true when user owns the project', async () => {
      mockGetUserInternalIdProvider.mockResolvedValue('user-uuid');
      mockCheckProjectOwnershipProvider.mockResolvedValue(true);

      const result = await service.ownsProject('clerk-user-id', 'project-uuid');

      expect(result).toBe(true);
      expect(mockGetUserInternalIdProvider).toHaveBeenCalledWith('clerk-user-id');
      expect(mockCheckProjectOwnershipProvider).toHaveBeenCalledWith('user-uuid', 'project-uuid');
    });

    it('should return false when user does not own the project', async () => {
      mockGetUserInternalIdProvider.mockResolvedValue('user-uuid');
      mockCheckProjectOwnershipProvider.mockResolvedValue(false);

      const result = await service.ownsProject('clerk-user-id', 'project-uuid');

      expect(result).toBe(false);
      expect(mockGetUserInternalIdProvider).toHaveBeenCalledWith('clerk-user-id');
      expect(mockCheckProjectOwnershipProvider).toHaveBeenCalledWith('user-uuid', 'project-uuid');
    });
  });

  describe('upsertUserFromClerk', () => {
    const mockClerkUser = {
      id: 'clerk-user-id',
      email_addresses: [{ email_address: 'test@example.com' }],
      first_name: 'Test',
      last_name: 'User',
    };

    it('should create new user when user does not exist', async () => {
      const mockNewUser = {
        id: 'user-uuid',
        clerkUserId: 'clerk-user-id',
        email: 'test@example.com',
        name: 'Test User'
      };
      mockUpsertUserFromClerkProvider.mockResolvedValue(mockNewUser);

      const result = await service.upsertUserFromClerk(mockClerkUser);

      expect(result).toEqual(mockNewUser);
      expect(mockUpsertUserFromClerkProvider).toHaveBeenCalledWith(mockClerkUser);
    });

    it('should update existing user when user exists', async () => {
      const mockUpdatedUser = {
        id: 'user-uuid',
        clerkUserId: 'clerk-user-id',
        email: 'test@example.com',
        name: 'Test User'
      };
      mockUpsertUserFromClerkProvider.mockResolvedValue(mockUpdatedUser);

      const result = await service.upsertUserFromClerk(mockClerkUser);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUpsertUserFromClerkProvider).toHaveBeenCalledWith(mockClerkUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and associated data', async () => {
      mockGetUserInternalIdProvider.mockResolvedValue('user-uuid');
      mockDeleteUserProvider.mockResolvedValue(undefined);

      await service.deleteUser('clerk-user-id');

      expect(mockGetUserInternalIdProvider).toHaveBeenCalledWith('clerk-user-id');
      expect(mockDeleteUserProvider).toHaveBeenCalledWith('user-uuid');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockGetUserInternalIdProvider.mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.deleteUser('nonexistent-user')).rejects.toThrow(NotFoundException);
      expect(mockGetUserInternalIdProvider).toHaveBeenCalledWith('nonexistent-user');
      expect(mockDeleteUserProvider).not.toHaveBeenCalled();
    });
  });
});