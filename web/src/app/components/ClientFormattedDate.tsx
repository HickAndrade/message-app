"use client";

import { useEffect, useState } from "react";

import { formatClientDate } from "@/app/utils/formatClientDate";

interface ClientFormattedDateProps {
    value: string;
    pattern: string;
    className?: string;
}

const ClientFormattedDate = ({
    value,
    pattern,
    className
}: ClientFormattedDateProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const dateTime = new Date(value).toISOString();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <time
            suppressHydrationWarning
            className={className}
            dateTime={dateTime}
        >
            {isMounted ? formatClientDate(value, pattern) : ""}
        </time>
    );
};

export default ClientFormattedDate;
