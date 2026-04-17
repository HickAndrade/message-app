import { AsyncLocalStorage } from "node:async_hooks";

import fp from "fastify-plugin";

export type RequestContext = {
    requestId: string;
};

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

function getRequestContext() {
    return requestContextStorage.getStore() ?? null;
}

export default fp(async (app) => {
    app.decorate("getRequestContext", getRequestContext);

    app.addHook("onRequest", (request, _reply, done) => {
        requestContextStorage.run({
            requestId: request.id
        }, done);
    });
}, {
    name: "request-context-plugin"
});

declare module "fastify" {
    interface FastifyInstance {
        getRequestContext: () => RequestContext | null;
    }
}
