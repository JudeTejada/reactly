import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { GetUserByClerkIdProvider } from "./get-user-by-clerk-id.provider";
import { DRIZZLE_ASYNC_PROVIDER } from "../../../db/providers/drizzle.provider";

// Mock the schema to avoid ES module issues
jest.mock("../../../db/schema", () => ({
  users: {
    id: "id",
    clerkUserId: "clerk_user_id",
    email: "email",
    name: "name",
  },
}));

describe("GetUserByClerkIdProvider", () => {
  let provider: GetUserByClerkIdProvider;
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
        GetUserByClerkIdProvider,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockDb,
        },
      ],
    }).compile();

    provider = module.get<GetUserByClerkIdProvider>(GetUserByClerkIdProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(provider).toBeDefined();
  });

  describe("execute", () => {
    it("should return user when user exists", async () => {
      const mockUser = {
        id: "user-uuid",
        clerkUserId: "clerk-user-123",
        email: "test@example.com",
        name: "Test User",
      };
      mockQueryBuilder.limit.mockResolvedValueOnce([mockUser]);

      const result = await provider.execute("clerk-user-123");

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException when user does not exist", async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([]);

      await expect(provider.execute("nonexistent-user")).rejects.toThrow(
        NotFoundException
      );
      await expect(provider.execute("nonexistent-user")).rejects.toThrow(
        "User not found"
      );
    });

    it("should call database with correct parameters", async () => {
      const mockUser = {
        id: "user-uuid",
        clerkUserId: "clerk-user-456",
        email: "test@example.com",
        name: "Test User",
      };
      mockQueryBuilder.limit.mockResolvedValueOnce([mockUser]);

      await provider.execute("clerk-user-456");

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
    });
  });
});
