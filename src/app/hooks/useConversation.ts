import { useParams } from 'next/navigation';
import { useMemo } from 'react';

const useConversation = () =>{
    const params = useParams();

    const conversationId = useMemo(() => {
        if(!params?.conversationId) {
            console.log(params)
            return ''
            
        }

        console.log(params)
        return params.conversationId as string;
    },[params?.conversationId])

    const isOpen = useMemo(() => !!conversationId, [conversationId])

    return useMemo(() => ({
        isOpen,
        conversationId
     }),[])
}

export default useConversation;