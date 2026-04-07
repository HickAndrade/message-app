import getConversations from "../getConversations";
import { apiJson, getSessionEmail } from "../api-client";

jest.mock("../api-client", () => ({
    __esModule: true,
    apiJson: jest.fn(),
    getSessionEmail: jest.fn()
}));

const apiJsonMock = apiJson as jest.Mock;
const getSessionEmailMock = getSessionEmail as jest.Mock;

describe("getConversations", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return an empty array when there is no session email", async () => {
        getSessionEmailMock.mockResolvedValueOnce(null);

        const conversations = await getConversations();

        expect(conversations).toEqual([]);
        expect(apiJsonMock).not.toHaveBeenCalled();
    });

    it("should return conversations when the api responds", async () => {
        const conversationsMock = [{ id: "conversation-1" }];

        getSessionEmailMock.mockResolvedValueOnce("email@example.com");
        apiJsonMock.mockResolvedValueOnce(conversationsMock);

        const conversations = await getConversations();

        expect(apiJsonMock).toHaveBeenCalledWith("/conversations", {
            method: "GET"
        }, "email@example.com");
        expect(conversations).toEqual(conversationsMock);
    });

    it("should return an empty array when the api fails", async () => {
        getSessionEmailMock.mockResolvedValueOnce("email@example.com");
        apiJsonMock.mockResolvedValueOnce(null);

        const conversations = await getConversations();

        expect(conversations).toEqual([]);
    });
});
