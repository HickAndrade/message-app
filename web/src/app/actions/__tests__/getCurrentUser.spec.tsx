import getCurrentUser from "../getCurrentUser";
import { apiJson } from "../api-client";

jest.mock("../api-client", () => ({
    __esModule: true,
    apiJson: jest.fn()
}));

const apiJsonMock = apiJson as jest.Mock;

describe("getCurrentUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the current user when the api responds", async () => {
        const userData = {
            id: "user-1",
            email: "email@example.com",
            name: "User"
        };

        apiJsonMock.mockResolvedValueOnce(userData);

        const user = await getCurrentUser();

        expect(apiJsonMock).toHaveBeenCalledWith("/auth/me", {
            method: "GET"
        });
        expect(user).toEqual(userData);
    });

    it("should return null when the api fails", async () => {
        apiJsonMock.mockResolvedValueOnce(null);

        const user = await getCurrentUser();

        expect(user).toBeNull();
    });
});
