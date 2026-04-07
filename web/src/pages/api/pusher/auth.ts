import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { buildApiUrl } from "@/app/actions/api-client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

//https://pusher.com/docs/channels/server_api/authorizing-users/

export default async function handler(request: NextApiRequest, response:NextApiResponse){
    const session = await getServerSession(request, response, authOptions);

    if(!session?.user?.email){
        return response.status(401).end();
    }

    const apiResponse = await fetch(buildApiUrl("/pusher/auth"), {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-user-email": session.user.email
        },
        body: JSON.stringify(request.body ?? {})
    });

    const body = await apiResponse.text();

    response.status(apiResponse.status);
    response.setHeader("content-type", apiResponse.headers.get("content-type") ?? "application/json");

    return response.send(body);
}

