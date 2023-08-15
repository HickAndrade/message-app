"use client";

import clsx from "clsx";

import useConversation from "@/app/hooks/useConversation";
import { FullConversationType } from "@/app/types";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ConversationListProps{
    initialItems: FullConversationType[]
}

const ConversationList = ({ initialItems }: ConversationListProps) => {
    const [items, setItems] = useState(initialItems);
    const router = useRouter();
    const { conversationId, isOpen } = useConversation();

  return (
   <aside className={clsx(`
    fixed
   `)}>
    </aside>
  )
}

export default ConversationList
