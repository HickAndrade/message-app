import { NextApiRequest, NextApiResponse } from "next";

import { buildApiUrl } from "@/app/actions/api-url";

//https://pusher.com/docs/channels/server_api/authorizing-users/

export default async function handler(request: NextApiRequest, response:NextApiResponse){
    const apiResponse = await fetch(buildApiUrl("/pusher/auth"), {
        method: "POST",
        headers: {
            "content-type": "application/json",
            cookie: request.headers.cookie ?? ""
        },
        body: JSON.stringify(request.body ?? {})
    });

    const body = await apiResponse.text();

    response.status(apiResponse.status);
    response.setHeader("content-type", apiResponse.headers.get("content-type") ?? "application/json");

    return response.send(body);
}

