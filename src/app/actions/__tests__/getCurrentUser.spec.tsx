import getCurrentUser from "../getCurrentUser";
import getSession from "../getSession";
import prisma from '../../libs/prismadb';
import { parse } from 'date-fns'

const findUniqueSpy = jest.spyOn(prisma.user, 'findUnique');

jest.mock('../getSession', () => ({
    __esModule: true,
    default: jest.fn(() => ({
      user:{
        name: 'name',
        email: 'email'
      }
    }))
}));


describe('getCurrentUser', () => {

  it('Should return null when session not exists', async () => {
  (getSession as jest.Mock).mockResolvedValueOnce({
    user: {
      name: 'name',
      email: null
    }
  })
  
   const user = await getCurrentUser();
   
   expect(findUniqueSpy).not.toHaveBeenCalled();
   expect(user).toBeNull();
  });

  it('Should search currentUser when session exists', async () => {
    const dateFormat = parse('16/09/2023', 'dd/MM/yyyy', new Date());
    const userData = {
      id: 'string',
      name: 'string',
      email: 'email',
      emailVerified: null,
      image: 'string',
      hashedPassword: 'string',
      createdAt: dateFormat,
      updatedAt: dateFormat,
      conversationIds: [''],
      seenMessageIds: [''],
    }

     findUniqueSpy.mockResolvedValueOnce(userData);

    const user = await getCurrentUser();

    expect(getSession).toHaveBeenCalled();
    expect(findUniqueSpy).toHaveBeenCalledWith({
      where: {
        email: 'email'
      }
    })

    expect(user).toEqual(userData);
    
  });
 
  
  it('Should return null when the email is not registered', async () => {
    const userData: null = null;
    findUniqueSpy.mockResolvedValueOnce(userData);

    const user = await getCurrentUser();

    expect(getSession).toHaveBeenCalled();
    expect(findUniqueSpy).toHaveBeenCalledWith({
      where: {
        email: 'email'
      }
    })

    expect(user).toBeNull();
  });
  
  
  it("Should return null when catch an error", async () => {
  (getSession as jest.Mock).mockRejectedValue(() => {
    new Error('Testing catch');
  })
   
   const user = await getCurrentUser();

   expect(user).toBeNull();
  });
  
})