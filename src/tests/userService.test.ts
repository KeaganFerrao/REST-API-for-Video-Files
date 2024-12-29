import { UserAttributes } from "../models/user";
import { user } from "../models";
import { UserSequelizeService } from "../services/user";

jest.mock("../models", () => ({
    user: {
        findOne: jest.fn(),
    }
}));

describe("UserSequelizeService", () => {
    const service = new UserSequelizeService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getUserFromAPIKey", () => {
        it("should return user attributes by key", async () => {
            const token = 'token1';
            const mockUser = { id: 1, userName: "user1", token: "token1" };
            (user.findOne as jest.Mock).mockResolvedValue({ dataValues: mockUser });

            const result = await service.getUserFromAPIKey(token);

            expect(user.findOne).toHaveBeenCalledWith({
                attributes: ['id', 'userName', 'token'],
                where: {
                    token
                }
            });
            expect(result).toEqual<UserAttributes>(mockUser);
        });

        it("should return undefined if key is not found", async () => {
            const key = 'token1';
            (user.findOne as jest.Mock).mockResolvedValue(null);

            const result = await service.getUserFromAPIKey(key);

            expect(result).toBeUndefined();
        });
    });
});
