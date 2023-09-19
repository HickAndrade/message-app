import getConversations from "../getConversations";
import getCurrentUser from "../getCurrentUser";
import prisma from "../../libs/prismadb"

jest.mock("../getCurrentUser", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    id: null,
    email: null
})),
}));


jest.mock('../../libs/prismadb', () => ({
  __esModule: true,
   default: {
    conversation: {
      findMany: jest.fn(() => ([{
        id: 1
      }]))
    }
   }
}))

describe("getConversation", () => {

  it("should return an empty array when currentUser is null", async () => {
    const conversations = await getConversations();

    expect(getCurrentUser).toBeCalled();
    expect(conversations).toEqual([]);
  });

  it("should conversations when currentUser exists", async () => {
    
    (getCurrentUser as jest.Mock).mockReturnValue(({ id: '123' }));
    const conversations = await getConversations();

    expect(prisma.conversation.findMany).toBeCalled();
    expect(conversations).toEqual([{ id: 1 }])
  });

  it("should return empty array when prisma throw an error" , async () => {

    (prisma.conversation.findMany as jest.Mock).mockImplementation(() => { throw new Error('Testing Error') });

    const conversation = await getConversations();

    expect(conversation).toEqual([]);

  });

});