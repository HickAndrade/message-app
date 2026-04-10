import getConversations from "../getConversations";
import { apiJson } from "../api-client";

jest.mock("../api-client", () => ({
    __esModule: true,
    apiJson: jest.fn()
}));

const apiJsonMock = apiJson as jest.Mock;

describe("getConversations", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return conversations when the api responds", async () => {
        const conversationsMock = [{ id: "conversation-1" }];

        apiJsonMock.mockResolvedValueOnce(conversationsMock);

        const conversations = await getConversations();

        expect(apiJsonMock).toHaveBeenCalledWith("/conversations", {
            method: "GET"
        });
        expect(conversations).toEqual(conversationsMock);
    });

    it("should return an empty array when the api fails", async () => {
        apiJsonMock.mockResolvedValueOnce(null);

        const conversations = await getConversations();

        expect(conversations).toEqual([]);
    });
});
