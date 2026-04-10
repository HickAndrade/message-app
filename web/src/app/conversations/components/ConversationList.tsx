"use client";

import clsx from "clsx";

import useConversation from "@/app/hooks/useConversation";
import { FullConversationType } from "@/app/types";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdOutlineGroupAdd } from "react-icons/md";
import ConversationBox from "./ConversationBox";
import GroupChatModal from "./GroupChatModal";
import { User } from "@prisma/client";
import { getPusherClient } from "@/app/libs/pusher";
import { find } from "lodash";
import { useAuth } from "@/app/context/AuthContext";


interface ConversationListProps{
    initialItems: FullConversationType[],
    users:User[]
}

const ConversationList = ({ initialItems, users }: ConversationListProps) => {
    const { currentUser } = useAuth();
    const [items, setItems] = useState(initialItems);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const router = useRouter();
    const { conversationId, isOpen } = useConversation();
    
    const pusherKey = useMemo(() => {
       return currentUser?.email;
    },[currentUser?.email])


    useEffect(() => {
      if(!pusherKey){
        return;
      }

      const pusherClient = getPusherClient();
      const channel = pusherClient.subscribe(pusherKey);

      const newHandler = (conversation: FullConversationType) => {
        setItems((current) => {
          if(find(current, { id: conversation.id })){
            return current;
          }
          return [conversation,...current]
        })
      }
      
      const updateHandler = (conversation: FullConversationType) => {
        setItems((current) => current.map((currentConversation) => {
            if(currentConversation.id === conversation.id){
              return {...currentConversation, messages: conversation.messages}
            }
            return currentConversation
          }))
      }

      const removeHandler = (conversation: FullConversationType) => {
        setItems((current) => {
          return [...current.filter((conv) => conv.id !== conversation.id)]
        })

        if(conversationId === conversation.id){
          router.push('/conversations');
        }
      }

      channel.bind('conversation:remove', removeHandler);
      channel.bind('conversation:new', newHandler);
      channel.bind('conversation:update', updateHandler);

      return  () =>{
        channel.unbind('conversation:new', newHandler);
        channel.unbind('conversation:update', updateHandler);
        channel.unbind('conversation:remove', removeHandler);
        pusherClient.unsubscribe(pusherKey);
      };

    }, [pusherKey, conversationId, router]);

  return (
   <>
   <GroupChatModal users={users} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

   <aside className={clsx(`
    fixed
    inset-y-0
    pb-20
    lg:pb-0
    lg:left-20
    lg:w-80
    lg:block
    overflow-y-auto
    border-r
    border-gray-200
    w-full`, isOpen ?  'hidden' : 'block w-full left-0')}>
       <div className="px-5">
        <div className="flex justify-between mb-4 pt-4">
        <div className="text-2xl font-bold text-neural-800">Mensagens</div>
        <div 
        onClick={() => setIsModalOpen(true)}
        className="
        rounded-full
        p-2
        bg-gray-200
        text-gray-600
        cursor-pointer
        hover:opacity-75
        transition
         ">
            <MdOutlineGroupAdd size={20}/>
        </div>
        </div>
        {
        items.map((item) =>(
            <ConversationBox key={item.id} data={item} selected={conversationId === item.id}/>
        ))}
       </div>
    </aside>
   </>
  )
}

export default ConversationList
