import getSession from "../getSession"
import getUsers from "../getUsers"
import prisma from "@/app/libs/prismadb";
import { parse } from 'date-fns';

jest.mock('../getSession', () => ({
    __esModule: true,
    default: jest.fn(async () => ({ 
        user: {
            name: 'name',
            email: 'email'
    }}))
}))

const findManySpy = jest.spyOn(prisma.user, 'findMany');

const getSessionMock = getSession as jest.Mock;

describe('getUsers', () =>{
    it("Should return empty array when session does not have a user email", async() => {
        getSessionMock.mockResolvedValueOnce({})

        const users = await getUsers();

        expect(users).toEqual([]);
    });

    it("Should return users when session is valid", async () => {
        const dateFormat = parse('16/09/2023', 'dd/MM/yyyy', new Date());
        const usersMock = [{
            id: 'string',
            name: 'string',
            email: 'string',
            emailVerified:null,
            image: null,
            hashedPassword:  null,
            createdAt: dateFormat,
            updatedAt: dateFormat,
            conversationIds: [''],
            seenMessageIds: ['']
        }]
        
        findManySpy.mockResolvedValueOnce(usersMock);

        const users = await getUsers();

        expect(findManySpy).toBeCalledWith({
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                NOT: {
                    email: 'email'
                }
            }
        });
    
        expect(users.length).toBeGreaterThan(0);

    });

    it("Should return empty array when catch an error", async () => {
        findManySpy.mockRejectedValueOnce(async () => {
            new Error('Simulated Error');
        })

        const users = await getUsers();

        expect(users).toEqual([]);
    })
})