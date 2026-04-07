import getConversationById from "../getConversationsById";
import { apiJson, getSessionEmail } from "../api-client";

jest.mock("../api-client", () => ({
    __esModule: true,
    apiJson: jest.fn(),
    getSessionEmail: jest.fn()
}));

const apiJsonMock = apiJson as jest.Mock;
const getSessionEmailMock = getSessionEmail as jest.Mock;

describe("getConversationById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return null when there is no session email", async () => {
        getSessionEmailMock.mockResolvedValueOnce(null);

        const conversation = await getConversationById("1");

        expect(conversation).toBeNull();
        expect(apiJsonMock).not.toHaveBeenCalled();
    });

    it("should return the conversation when the api responds", async () => {
        const conversationMock = {
            id: "1",
            users: []
        };

        getSessionEmailMock.mockResolvedValueOnce("email@example.com");
        apiJsonMock.mockResolvedValueOnce(conversationMock);

        const conversation = await getConversationById("1");

        expect(apiJsonMock).toHaveBeenCalledWith("/conversations/1", {
            method: "GET"
        }, "email@example.com");
        expect(conversation).toEqual(conversationMock);
    });

    it("should return null when the api fails", async () => {
        getSessionEmailMock.mockResolvedValueOnce("email@example.com");
        apiJsonMock.mockResolvedValueOnce(null);

        const conversation = await getConversationById("1");

        expect(conversation).toBeNull();
    });
});
