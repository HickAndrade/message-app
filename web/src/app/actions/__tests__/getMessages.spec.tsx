import getMessages from "../getMessages";
import { apiJson, getSessionEmail } from "../api-client";

jest.mock("../api-client", () => ({
    __esModule: true,
    apiJson: jest.fn(),
    getSessionEmail: jest.fn()
}));

const apiJsonMock = apiJson as jest.Mock;
const getSessionEmailMock = getSessionEmail as jest.Mock;

describe("getMessages", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return an empty array when there is no session email", async () => {
        getSessionEmailMock.mockResolvedValueOnce(null);

        const messages = await getMessages("invalidId");

        expect(messages).toEqual([]);
        expect(apiJsonMock).not.toHaveBeenCalled();
    });

    it("should return messages when the api responds", async () => {
        const messagesMock = [{ id: "message-1" }];

        getSessionEmailMock.mockResolvedValueOnce("email@example.com");
        apiJsonMock.mockResolvedValueOnce(messagesMock);

        const messages = await getMessages("validId");

        expect(apiJsonMock).toHaveBeenCalledWith("/conversations/validId/messages", {
            method: "GET"
        }, "email@example.com");
        expect(messages).toEqual(messagesMock);
    });

    it("should return an empty array when the api fails", async () => {
        getSessionEmailMock.mockResolvedValueOnce("email@example.com");
        apiJsonMock.mockResolvedValueOnce(null);

        const messages = await getMessages("understandId");

        expect(messages).toEqual([]);
    });
});
