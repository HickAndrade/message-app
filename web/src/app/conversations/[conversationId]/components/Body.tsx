"use client"

import useConversation from "@/app/hooks/useConversation";
import { FullMessageType } from "@/app/types";
import { useState,useRef, useEffect } from "react";
import MessageBox from "./MessageBox";
import axios from "axios";
import { getPusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

interface BodyProps {
  initialMessages: FullMessageType[];
}

const Body = ({ initialMessages }: BodyProps) => {
  const[messages, setMessages] = useState(initialMessages);
  const bottomRef= useRef<HTMLDivElement>(null);

  const { conversationId } = useConversation();

  useEffect(() => {
    const pusherClient = getPusherClient();
    const channel = pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: FullMessageType) =>{
      setMessages((current) => {
        if(find(current, {id: message.id})){
          return current;
        }
        return [...current, message]
      })
      axios.post(`/api/conversations/${conversationId}/seen`);
    }
    
    bottomRef?.current?.scrollIntoView();

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) => current.map((currentMessage) => {
        if(currentMessage.id === newMessage.id){
          return newMessage;
        }
        return currentMessage;
      }))
    }

    channel.bind('messages:new', messageHandler);
    channel.bind('message:update', updateMessageHandler);
    

    return () => {
      channel.unbind('messages:new', messageHandler);
      channel.unbind('message:update', updateMessageHandler);
      pusherClient.unsubscribe(conversationId);
    }

  }, [conversationId]);

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`)
  },[conversationId])


  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox 
         isLast={i === messages.length - 1}
         key={message.id}
         data={message}
        />
      ))}
        <div ref={bottomRef} className="pt-24"/>
    </div>
  )
}

export default Body;
