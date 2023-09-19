import getConversationById from "../getConversationsById"
import getCurrentUser from "../getCurrentUser"
import prisma from "../../libs/prismadb";

jest.mock('../getCurrentUser', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        id: null,
        email: null
    }))
}))

// const findUniqueSpy = jest.spyOn(prisma.conversation, 'findUnique');

jest.mock('../../libs/prismadb', () => ({
    __esModule: true,
    default: {
        conversation: {
            findUnique: jest.fn((query) => {
                if (query.where.id === '1') {
                    return {
                        id: '1',
                        users: [],
                        isGroup: false,
                    };
                } else {
                    return null;
                }
            }),
        },
    },
}));

describe("getConvesationsById", () => {
    it("should return null when user does not have email", async() => {
        const conversation = await getConversationById('1');

        expect(conversation).toBe(null);
    })

    it("should return conversation when conversationId is valid", async() => {
        (getCurrentUser as jest.Mock).mockResolvedValue({
            id: 123,
            email: 'email'
        })

        const conversation = await getConversationById('1');
        
        expect(prisma.conversation.findUnique).toHaveBeenCalledWith({
            where: {
              id: '1', 
            },
            include: {
              users: true,
            },
          });

        expect(conversation).toEqual({
            id: '1',
            users: [],
            isGroup: false,
        })
    })

    it("should return null when conversationId is invalid", async() => {
        (getCurrentUser as jest.Mock).mockResolvedValue({
            id: 123,
            email: 'email'
        })

        const conversation = await getConversationById('2');
        expect(conversation).toBeNull;
    })

    it("should return null when throw an error", async () => {
        (getCurrentUser as jest.Mock).mockRejectedValue(() => {
            throw new Error('Testing Error')
        })

        const conversation = await getConversationById('1');
        expect(conversation).toBeNull();
    })

})



