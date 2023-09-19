import getMessages from "../getMessages";
import prisma from "@/app/libs/prismadb";
import { parse } from "date-fns";

const findManySpy = jest.spyOn(prisma.message, "findMany");

describe('getMessages', () => {
    it('Should return empty array when coversationId is invalid', async () => {
        const messages = await getMessages('invalidId');

        expect(messages).toEqual([]);
    })
    it('Should return messages when conversationID is valid', async () => {
        const dateFormat = parse('16/09/2023', 'dd/MM/yyyy', new Date());
        const messagesMock = [{
            id: 'string',
            body:  null,
            image: null,
            createdAt:  dateFormat,
            seenIds: [''],
            conversationId: '',
            senderId: ''
        }]

        findManySpy.mockResolvedValue(messagesMock);

        const messages = await getMessages('validId');
        
        expect(findManySpy).toHaveBeenCalledWith({
            where: {
                conversationId: 'validId'
            },
            include: {
                sender: true,
                seen: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        expect(messages).toEqual(messagesMock);
    })

    it('Should return an empty array when catch an error', async() => {
        findManySpy.mockRejectedValueOnce(async () => {
            new Error('Simulated Error');
        })

        const messages = await getMessages('understandId')

        expect(messages).toEqual([]);

    })
})