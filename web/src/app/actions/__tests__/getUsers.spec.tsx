import getUsers from "../getUsers";
import { apiJson } from "../api-client";

jest.mock("../api-client", () => ({
    __esModule: true,
    apiJson: jest.fn()
}));

const apiJsonMock = apiJson as jest.Mock;

describe("getUsers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return users when the api responds", async () => {
        const usersMock = [
            {
                id: "user-1",
                email: "user@example.com"
            }
        ];

        apiJsonMock.mockResolvedValueOnce(usersMock);

        const users = await getUsers();

        expect(apiJsonMock).toHaveBeenCalledWith("/users", {
            method: "GET"
        });
        expect(users).toEqual(usersMock);
    });

    it("should return an empty array when the api fails", async () => {
        apiJsonMock.mockResolvedValueOnce(null);

        const users = await getUsers();

        expect(users).toEqual([]);
    });
});
