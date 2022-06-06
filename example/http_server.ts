import { serve } from "https://deno.land/std@0.142.0/http/server.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { AuthClient } from "../src/access_token.ts";

const env = config();
const client = new AuthClient({
    clientId: env["CLIENT_ID"],
    clientSecret: env["CLIENT_SECRET"],
    redirectUrl: env["REDIRECT_URL"],
});

const handler = async (request: Request): Promise<Response> => {
    const url = new URL(request.url);

    if (url.pathname === env["REDIRECT_PATH"]) {
        return await handleOAuth(url);
    }

    return new Response("Not Found", { status: 404 });
};

async function handleOAuth(url: URL) {
    const code = url.searchParams.get("code");
    if (!code) return new Response("Missing code", { status: 400 });

    const accessToken = await client.fetchToken(code);
    console.log(Deno.inspect(accessToken));
    return new Response(JSON.stringify(accessToken), { status: 200 });
}

await serve(handler, { port: 3000 });
