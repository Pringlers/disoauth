const TOKEN_URL = "https://discord.com/api/v10/oauth2/token";

interface RawAccessToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

export class AccessToken {
    readonly #client: AuthClient;
    readonly #createdAt: number;

    public type: string;
    public token: string;
    public refreshToken: string;
    public expiresIn: number;
    public scope: string;

    public constructor(client: AuthClient, data: RawAccessToken) {
        this.#client = client;
        this.type = data.token_type;
        this.token = data.access_token;
        this.refreshToken = data.refresh_token;
        this.expiresIn = data.expires_in;
        this.scope = data.scope;
        this.#createdAt = Math.floor(Date.now() / 1_000);
    }

    public get expiresAt(): number {
        return this.#createdAt + this.expiresIn;
    }

    public get isExpired(): boolean {
        return Math.floor(Date.now() / 1_000) >= this.expiresAt;
    }

    public async refresh(): Promise<AccessToken> {
        return await this.#client.refreshToken(this.refreshToken);
    }

    public toJSON(): RawAccessToken {
        return {
            access_token: this.token,
            token_type: this.type,
            expires_in: this.expiresIn,
            refresh_token: this.refreshToken,
            scope: this.scope,
        };
    }
}

export interface AuthClientOptions {
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
}

export class AuthClient {
    readonly #options: AuthClientOptions;

    public constructor(options: AuthClientOptions) {
        this.#options = options;
    }

    public async fetchToken(code: string): Promise<AccessToken> {
        const body = new URLSearchParams({
            "client_id": this.#options.clientId,
            "client_secret": this.#options.clientSecret,
            "grant_type": "authorization_code",
            code,
            "redirect_uri": this.#options.redirectUrl,
        });
        const response = await fetch(TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        if (!response.ok) {
            const debug = `${response.statusText} ${JSON.stringify(await response.json())}`;
            throw Error("Failed to fetch access token: " + debug);
        }
        return new AccessToken(this, await response.json());
    }

    public async refreshToken(refreshToken: string): Promise<AccessToken> {
        return await this.#refreshToken(refreshToken);
    }

    async #refreshToken(refreshToken: string) {
        const body = new URLSearchParams({
            "client_id": this.#options.clientId,
            "client_secret": this.#options.clientSecret,
            "grant_type": "refresh_token",
            "refresh_token": refreshToken,
        });
        const response = await fetch(TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        if (!response.ok) {
            const debug = `${response.statusText} ${JSON.stringify(await response.json())}`;
            throw Error("Failed to refresh access token: " + debug);
        }
        return new AccessToken(this, await response.json());
    }
}
