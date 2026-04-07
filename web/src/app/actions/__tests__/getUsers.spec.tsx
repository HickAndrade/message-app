import getUsers from "../getUsers";
import { apiJson, getSessionEmail } from "../api-client";

jest.mock("../api-client", () => ({
    __esModule: true,
    apiJson: jest.fn(),
    getSessionEmail: jest.fn()
}));

const apiJsonMock = apiJson as jest.Mock;
const getSessionEmailMock = getSessionEmail as jest.Mock;

describe("getUsers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return an empty array when there is no session email", async () => {
        getSessionEmailMock.mockResolvedValueOnce(null);

        const users = await getUsers();

        expect(users).toEqual([]);
        expect(apiJsonMock).not.toHaveBeenCalled();
    });

    it("should return users when the api responds", async () => {
        const usersMock = [
            {
                id: "user-1",
                email: "user@example.com"
            }
        ];

        getSessionEmailMock.mockResolvedValueOnce("email@example.com");
        apiJsonMock.mockResolvedValueOnce(usersMock);

        const users = await getUsers();

        expect(apiJsonMock).toHaveBeenCalledWith("/users", {
            method: "GET"
        }, "email@example.com");
        expect(users).toEqual(usersMock);
    });

    it("should return an empty array when the api fails", async () => {
        getSessionEmailMock.mockResolvedValueOnce("email@example.com");
        apiJsonMock.mockResolvedValueOnce(null);

        const users = await getUsers();

        expect(users).toEqual([]);
    });
});
