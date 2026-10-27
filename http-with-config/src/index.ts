import { createAction, createPlug, PlugAuth, Property } from "@collabase/plug-framework";

const REQUEST_TIMEOUT_MS = 15_000;

const auth = PlugAuth.CustomAuth({
    displayName: "Service",
    required: true,
    props: {
        baseUrl: Property.ShortText({ displayName: "Base URL", required: true, description: "For example https://api.example.com/v1" }),
        apiKey: PlugAuth.SecretText({ displayName: "API key", required: true }),
    },
    validate: async ({ auth: value }) => {
        try {
            const url = new URL(String(value.baseUrl));
            return url.protocol === "https:" ? { valid: true } : { valid: false, error: "The base URL must use https" };
        } catch {
            return { valid: false, error: "The base URL is not a valid URL" };
        }
    },
});

const call = createAction({
    auth,
    name: "call_endpoint",
    displayName: "Call endpoint",
    description: "Sends a JSON request to a path below the configured base URL with the API key as bearer token.",
    props: {
        method: Property.StaticDropdown({
            displayName: "Method",
            required: true,
            defaultValue: "GET",
            options: { options: ["GET", "POST", "PUT", "DELETE"].map((method) => ({ label: method, value: method })) },
        }),
        path: Property.ShortText({ displayName: "Path", required: true, description: "For example /customers/42" }),
        body: Property.Json({ displayName: "Body", required: false }),
    },
    run: async (context) => {
        const { baseUrl, apiKey } = context.auth.props;
        const url = new URL(`${String(baseUrl).replace(/\/+$/, "")}/${String(context.propsValue.path).replace(/^\/+/, "")}`);
        const hasBody = context.propsValue.body !== undefined && context.propsValue.method !== "GET";
        const response = await fetch(url, {
            method: String(context.propsValue.method),
            headers: { authorization: `Bearer ${String(apiKey)}`, accept: "application/json", ...(hasBody ? { "content-type": "application/json" } : {}) },
            body: hasBody ? JSON.stringify(context.propsValue.body) : undefined,
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const text = await response.text();
        if (!response.ok) throw new Error(`The service answered with status ${response.status}`);
        return { status: response.status, body: text.length > 0 ? JSON.parse(text) : null };
    },
});

export const plug = createPlug({
    displayName: "HTTP with configuration",
    description: "Calls a service whose address and key the user configures.",
    logoUrl: "https://example.com/http-with-config.svg",
    auth,
    minimumSupportedRelease: "0.0.1",
    authors: [],
    actions: [call],
    triggers: [],
});
