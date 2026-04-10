import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { HiChat } from "react-icons/hi"
import { HiArrowLeftOnRectangle, HiUsers } from "react-icons/hi2"

import useConversation from "./useConversation";
import { useAuth } from "../context/AuthContext";


const useRoutes = () => {
    const pathname = usePathname();
    const { conversationId } = useConversation();
    const { logout } = useAuth();


    const routes = useMemo(() => [
        {
            label: 'Chat',
            href: '/conversations',
            icon: HiChat,
            active: pathname === '/conversations' || !!conversationId
        },
        {
            label: 'Users',
            href: '/users',
            icon: HiUsers,
            active: pathname === '/users' 
        },
        {
            label: 'Logout',
            href: '#',  
            onClick: () => {
                void logout();
            },
            icon: HiArrowLeftOnRectangle
        }
    ], [pathname, conversationId, logout])

    return routes;
}

export default useRoutes;


