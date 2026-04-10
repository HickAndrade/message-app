import getConversationById from "../getConversationsById";
import { apiJson } from "../api-client";

jest.mock("../api-client", () => ({
    __esModule: true,
    apiJson: jest.fn()
}));

const apiJsonMock = apiJson as jest.Mock;

describe("getConversationById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the conversation when the api responds", async () => {
        const conversationMock = {
            id: "1",
            users: []
        };

        apiJsonMock.mockResolvedValueOnce(conversationMock);

        const conversation = await getConversationById("1");

        expect(apiJsonMock).toHaveBeenCalledWith("/conversations/1", {
            method: "GET"
        });
        expect(conversation).toEqual(conversationMock);
    });

    it("should return null when the api fails", async () => {
        apiJsonMock.mockResolvedValueOnce(null);

        const conversation = await getConversationById("1");

        expect(conversation).toBeNull();
    });
});
