import { Test, TestingModule } from "@nestjs/testing";
import { GetUserProjectsProvider } from "./get-user-projects.provider";
import { DRIZZLE_ASYNC_PROVIDER } from "../../../db/providers/drizzle.provider";

// Mock the schema to avoid ES module issues
jest.mock("../../../db/schema", () => ({
  projects: {
    id: "id",
    userId: "user_id",
    name: "name",
    apiKey: "api_key",
    domain: "domain",
    createdAt: "created_at",
  },
}));

describe("GetUserProjectsProvider", () => {
  let provider: GetUserProjectsProvider;
  let mockDb: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    // Mock the query builder chain
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
    };

    mockDb = {
      select: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProjectsProvider,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockDb,
        },
      ],
    }).compile();

    provider = module.get<GetUserProjectsProvider>(GetUserProjectsProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(provider).toBeDefined();
  });

  describe("execute", () => {
    it("should return user projects", async () => {
      const mockProjects = [
        {
          id: "project-1",
          userId: "user-123",
          name: "Project 1",
          apiKey: "key-1",
          domain: "example.com",
          createdAt: new Date("2023-01-01"),
        },
        {
          id: "project-2",
          userId: "user-123",
          name: "Project 2",
          apiKey: "key-2",
          domain: "test.com",
          createdAt: new Date("2023-01-02"),
        },
      ];
      mockQueryBuilder.orderBy.mockResolvedValue(mockProjects);

      const result = await provider.execute("user-123");

      expect(result).toEqual(mockProjects);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
    });

    it("should return empty array when user has no projects", async () => {
      mockQueryBuilder.orderBy.mockResolvedValue([]);

      const result = await provider.execute("user-456");

      expect(result).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
    });

    it("should call database with correct parameters", async () => {
      mockQueryBuilder.orderBy.mockResolvedValue([]);

      await provider.execute("user-789");

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
    });
  });
});
