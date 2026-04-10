import { useEffect } from "react";
import useActiveList from "./useActiveList";
import { Members } from "pusher-js";
import { getPusherClient } from "../libs/pusher";

const useActiveChannel = (enabled = true) => {
    const { set, add, remove } = useActiveList();

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const pusherClient = getPusherClient();
        const channel = pusherClient.subscribe("presence-message");

        const subscriptionSucceededHandler = (members: Members) => {
            const initialMembers: string[] = [];

            members.each((member: Record<string, any>) => initialMembers.push(member.id));
            set(initialMembers);
        };

        const memberAddedHandler = (member: Record<string, any>) => {
            add(member.id);
        };

        const memberRemovedHandler = (member: Record<string, any>) => {
            remove(member.id);
        };

        channel.bind("pusher:subscription_succeeded", subscriptionSucceededHandler);
        channel.bind("pusher:member_added", memberAddedHandler);
        channel.bind("pusher:member_removed", memberRemovedHandler);

        return () => {
            channel.unbind("pusher:subscription_succeeded", subscriptionSucceededHandler);
            channel.unbind("pusher:member_added", memberAddedHandler);
            channel.unbind("pusher:member_removed", memberRemovedHandler);
            pusherClient.unsubscribe("presence-message");
            set([]);
        };
    }, [set, add, remove, enabled]);
};

export default useActiveChannel;
