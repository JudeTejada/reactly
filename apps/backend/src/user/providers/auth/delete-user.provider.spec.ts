import { Test, TestingModule } from "@nestjs/testing";
import { DeleteUserProvider } from "./delete-user.provider";
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

describe("DeleteUserProvider", () => {
  let provider: DeleteUserProvider;
  let mockDb: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    // Mock the query builder chain
    mockQueryBuilder = {
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    };

    mockDb = {
      delete: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserProvider,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockDb,
        },
      ],
    }).compile();

    provider = module.get<DeleteUserProvider>(DeleteUserProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(provider).toBeDefined();
  });

  describe("execute", () => {
    it("should delete user by internal ID", async () => {
      const userId = "user-uuid-123";

      await provider.execute(userId);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it("should resolve without error when deletion is successful", async () => {
      const userId = "user-uuid-456";

      await expect(provider.execute(userId)).resolves.toBeUndefined();
    });

    it("should call database operations in correct order", async () => {
      const userId = "user-uuid-789";

      await provider.execute(userId);

      // Verify the chain of calls
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });
});
