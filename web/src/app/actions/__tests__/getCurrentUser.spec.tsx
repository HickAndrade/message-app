import getCurrentUser from "../getCurrentUser";
import { apiJson, getSessionEmail } from "../api-client";

jest.mock("../api-client", () => ({
    __esModule: true,
    apiJson: jest.fn(),
    getSessionEmail: jest.fn()
}));

const apiJsonMock = apiJson as jest.Mock;
const getSessionEmailMock = getSessionEmail as jest.Mock;

describe("getCurrentUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return null when there is no session email", async () => {
        getSessionEmailMock.mockResolvedValueOnce(null);

        const user = await getCurrentUser();

        expect(user).toBeNull();
        expect(apiJsonMock).not.toHaveBeenCalled();
    });

    it("should return the current user when the api responds", async () => {
        const userData = {
            id: "user-1",
            email: "email@example.com",
            name: "User"
        };

        getSessionEmailMock.mockResolvedValueOnce("email@example.com");
        apiJsonMock.mockResolvedValueOnce(userData);

        const user = await getCurrentUser();

        expect(getSessionEmailMock).toHaveBeenCalled();
        expect(apiJsonMock).toHaveBeenCalledWith("/users/me", {
            method: "GET"
        }, "email@example.com");
        expect(user).toEqual(userData);
    });

    it("should return null when the api fails", async () => {
        getSessionEmailMock.mockResolvedValueOnce("email@example.com");
        apiJsonMock.mockResolvedValueOnce(null);

        const user = await getCurrentUser();

        expect(user).toBeNull();
    });
});
