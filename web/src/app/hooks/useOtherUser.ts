import { useMemo } from "react";
import type { FullConversationType, User } from "../types";
import { useAuth } from "../context/AuthContext";

const useOtherUser = (conversation: FullConversationType | {users: User[] }) => {
    const { currentUser } = useAuth();
    
    const otherUser = useMemo(() => {
        const currentEmail = currentUser?.email;

        const otherUser = conversation.users.filter((user) => user.email !== currentEmail);
        
        return otherUser[0];

    },[currentUser?.email, conversation.users]);

    return otherUser;
}; 

export default useOtherUser;
