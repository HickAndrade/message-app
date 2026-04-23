import getMessages from "../getMessages";
import { apiJson } from "../../services/api/server";

jest.mock("../../services/api/server", () => ({
    __esModule: true,
    apiJson: jest.fn()
}));

const apiJsonMock = apiJson as jest.Mock;

describe("getMessages", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return messages when the api responds", async () => {
        const messagesMock = [{ id: "message-1" }];

        apiJsonMock.mockResolvedValueOnce(messagesMock);

        const messages = await getMessages("validId");

        expect(apiJsonMock).toHaveBeenCalledWith("/conversations/validId/messages", {
            method: "GET"
        });
        expect(messages).toEqual(messagesMock);
    });

    it("should return an empty array when the api fails", async () => {
        apiJsonMock.mockResolvedValueOnce(null);

        const messages = await getMessages("understandId");

        expect(messages).toEqual([]);
    });
});
