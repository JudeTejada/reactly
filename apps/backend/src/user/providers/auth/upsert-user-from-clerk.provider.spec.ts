import { Test, TestingModule } from "@nestjs/testing";
import { UpsertUserFromClerkProvider } from "./upsert-user-from-clerk.provider";
import { DRIZZLE_ASYNC_PROVIDER } from "../../../db/providers/drizzle.provider";

// Mock the schema to avoid ES module issues
jest.mock("../../../db/schema", () => ({
  users: {
    id: "id",
    clerkUserId: "clerk_user_id",
    email: "email",
    name: "name",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
}));

describe("UpsertUserFromClerkProvider", () => {
  let provider: UpsertUserFromClerkProvider;
  let mockDb: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    // Mock the query builder chain for select
    const selectQueryBuilder = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    };

    // Mock the query builder chain for insert
    const insertQueryBuilder = {
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    };

    // Mock the query builder chain for update
    const updateQueryBuilder = {
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    };

    mockDb = {
      select: jest.fn().mockReturnValue(selectQueryBuilder),
      insert: jest.fn().mockReturnValue(insertQueryBuilder),
      update: jest.fn().mockReturnValue(updateQueryBuilder),
    };

    // Store references for test assertions
    mockQueryBuilder = {
      select: selectQueryBuilder,
      insert: insertQueryBuilder,
      update: updateQueryBuilder,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpsertUserFromClerkProvider,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockDb,
        },
      ],
    }).compile();

    provider = module.get<UpsertUserFromClerkProvider>(
      UpsertUserFromClerkProvider
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(provider).toBeDefined();
  });

  describe("execute", () => {
    const mockClerkUser = {
      id: "clerk-user-123",
      email_addresses: [{ email_address: "test@example.com" }],
      first_name: "John",
      last_name: "Doe",
    };

    it("should create new user when user does not exist", async () => {
      const mockNewUser = { id: "user-uuid", clerkUserId: mockClerkUser.id };
      mockQueryBuilder.select.limit.mockResolvedValueOnce([]); // User doesn't exist
      mockQueryBuilder.insert.returning.mockResolvedValueOnce([mockNewUser]); // Insert result

      const result = await provider.execute(mockClerkUser);

      expect(result).toEqual(mockNewUser);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockQueryBuilder.insert.values).toHaveBeenCalledWith({
        clerkUserId: mockClerkUser.id,
        email: "test@example.com",
        name: "John Doe",
      });
    });

    it("should update existing user when user exists", async () => {
      const mockExistingUser = {
        id: "user-uuid",
        clerkUserId: mockClerkUser.id,
      };
      mockQueryBuilder.select.limit.mockResolvedValueOnce([mockExistingUser]); // User exists
      mockQueryBuilder.update.returning.mockResolvedValueOnce([
        { ...mockExistingUser, name: "John Smith" },
      ]); // Update result

      const updatedClerkUser = { ...mockClerkUser, last_name: "Smith" };
      const result = await provider.execute(updatedClerkUser);

      expect(result.name).toBe("John Smith");
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockQueryBuilder.update.set).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "John Smith",
        updatedAt: expect.any(Date),
      });
    });

    it("should handle user with no name", async () => {
      const clerkUserNoName = {
        id: "clerk-user-456",
        email_addresses: [{ email_address: "noname@example.com" }],
      };
      const mockNewUser = {
        id: "user-uuid-2",
        clerkUserId: clerkUserNoName.id,
      };

      mockQueryBuilder.select.limit.mockResolvedValueOnce([]);
      mockQueryBuilder.insert.returning.mockResolvedValueOnce([mockNewUser]);

      const result = await provider.execute(clerkUserNoName);

      expect(result).toEqual(mockNewUser);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockQueryBuilder.insert.values).toHaveBeenCalledWith({
        clerkUserId: clerkUserNoName.id,
        email: "noname@example.com",
        name: null,
      });
    });

    it("should handle user with only first name", async () => {
      const clerkUserFirstName = {
        id: "clerk-user-789",
        email_addresses: [{ email_address: "firstname@example.com" }],
        first_name: "Jane",
      };
      const mockNewUser = {
        id: "user-uuid-3",
        clerkUserId: clerkUserFirstName.id,
      };

      mockQueryBuilder.select.limit.mockResolvedValueOnce([]);
      mockQueryBuilder.insert.returning.mockResolvedValueOnce([mockNewUser]);

      const result = await provider.execute(clerkUserFirstName);

      expect(result).toEqual(mockNewUser);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockQueryBuilder.insert.values).toHaveBeenCalledWith({
        clerkUserId: clerkUserFirstName.id,
        email: "firstname@example.com",
        name: "Jane",
      });
    });
  });
});
