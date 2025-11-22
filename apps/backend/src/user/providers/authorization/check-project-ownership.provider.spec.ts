import { Test, TestingModule } from "@nestjs/testing";
import { CheckProjectOwnershipProvider } from "./check-project-ownership.provider";
import { DRIZZLE_ASYNC_PROVIDER } from "../../../db/providers/drizzle.provider";

// Mock the schema to avoid ES module issues
jest.mock("../../../db/schema", () => ({
  projects: {
    id: "id",
    userId: "user_id",
  },
}));

describe("CheckProjectOwnershipProvider", () => {
  let provider: CheckProjectOwnershipProvider;
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
        CheckProjectOwnershipProvider,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockDb,
        },
      ],
    }).compile();

    provider = module.get<CheckProjectOwnershipProvider>(
      CheckProjectOwnershipProvider
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(provider).toBeDefined();
  });

  describe("execute", () => {
    it("should return true when user owns the project", async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([{ id: "project-uuid" }]);

      const result = await provider.execute("user-uuid", "project-uuid");

      expect(result).toBe(true);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should return false when user does not own the project", async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([]);

      const result = await provider.execute("user-uuid", "project-uuid");

      expect(result).toBe(false);
    });

    it("should call database with correct parameters", async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([]);

      await provider.execute("user-uuid", "project-uuid");

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
    });
  });
});
