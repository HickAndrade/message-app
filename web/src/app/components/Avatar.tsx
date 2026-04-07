"use client";

import { User } from "@prisma/client"
import Image from "next/image"
import useActiveList from "../hooks/useActiveList";


interface AvatarProps{
    user?: User;
}

const Avatar = ({ user }: AvatarProps)=>{
    const { members } = useActiveList();
    const isActive = members.indexOf(user?.email!) !== -1;

return (
    <div className="relative" >
        <div className="
        relative 
        inline-block 
        rounded-full 
        overflow-hidden
        h-9
        w-9
        md:h-11
        md:w-11
        ">
        <Image 
        alt="Avatar" 
        src={user?.image || '/images/placeholder.jpg'} 
        fill
        /> 
        </div>
        {isActive && (
            <span className="bg-green-500 rounded-full h-2 w-2 absolute md:h-3 md:w-3"/>
        )}
        
    </div>
)

}

export default Avatar;