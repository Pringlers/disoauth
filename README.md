# DisOAuth

A lightweight module to use [Discord's OAuth2 API](https://discord.com/developers/docs/topics/oauth2) for Deno.

## Usage

See `example/http_server.ts` for working example.

```ts
const client = new AuthClient({
    clientId: env["CLIENT_ID"],
    clientSecret: env["CLIENT_SECRET"],
    redirectUrl: env["REDIRECT_URL"],
});
const accessToken = await client.fetchToken(code);
if (accessToken.isExpired) {
    // Following lines do exactly same thing.
    const newAccessToken0 = await accessToken.refresh();
    const newAccessToken1 = await client.refreshToken(accessToken.refreshToken);
}
```
