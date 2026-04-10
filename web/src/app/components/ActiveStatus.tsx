"use client";

import { useAuth } from "../context/AuthContext";
import useActiveChannel from "../hooks/useActiveChannel";

const ActiveStatus = () => {
    const { currentUser } = useAuth();
    useActiveChannel(Boolean(currentUser));
    return null;
}

export default ActiveStatus
