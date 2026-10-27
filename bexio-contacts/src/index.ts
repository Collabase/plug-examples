import { createAction, createPlug, PlugAuth, Property } from "@collabase/plug-framework";

const API_BASE = "https://api.bexio.com";
const REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;
const PERSON_CONTACT_TYPE = 2;

const auth = PlugAuth.OAuth2({
    required: true,
    authUrl: "https://auth.bexio.com/realms/bexio/protocol/openid-connect/auth",
    tokenUrl: "https://auth.bexio.com/realms/bexio/protocol/openid-connect/token",
    scope: ["openid", "offline_access", "contact_show", "contact_edit", "kb_invoice_show"],
    validate: async ({ auth: connection }) => {
        try {
            await bexioRequest(connection.access_token, "GET", "/3.0/users/me");
            return { valid: true };
        } catch {
            return { valid: false, error: "bexio did not accept the connection" };
        }
    },
});

/** Sends one JSON request to the bexio API and returns the parsed answer. The token never leaves the header. */
async function bexioRequest(token: string, method: "GET" | "POST", path: string, query?: Record<string, string>, body?: unknown): Promise<unknown> {
    const url = new URL(`${API_BASE}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);
    const response = await fetch(url, {
        method,
        headers: { authorization: `Bearer ${token}`, accept: "application/json", ...(body === undefined ? {} : { "content-type": "application/json" }) },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`bexio answered with status ${response.status}`);
    return response.json();
}

function pageQuery(limit: unknown, offset: unknown): Record<string, string> {
    const bounded = Math.min(Math.max(Number(limit ?? DEFAULT_LIMIT), 1), MAX_LIMIT);
    return { limit: String(bounded), offset: String(Math.max(Number(offset ?? 0), 0)) };
}

const findContacts = createAction({
    auth,
    name: "find_contacts",
    displayName: "Find contacts",
    description: "Searches contacts by one field and returns the matches.",
    props: {
        field: Property.StaticDropdown({
            displayName: "Field",
            required: true,
            defaultValue: "mail",
            options: {
                options: [
                    { label: "Email", value: "mail" },
                    { label: "Last name or company", value: "name_1" },
                    { label: "First name", value: "name_2" },
                    { label: "City", value: "city" },
                ],
            },
        }),
        value: Property.ShortText({ displayName: "Value", required: true, description: "Contacts that contain this text are returned." }),
        limit: Property.Number({ displayName: "Limit", required: false, description: `At most ${MAX_LIMIT}, ${DEFAULT_LIMIT} by default.` }),
    },
    run: async (context) => {
        const criteria = [{ field: String(context.propsValue.field), value: String(context.propsValue.value), criteria: "like" }];
        return bexioRequest(context.auth.access_token, "POST", "/2.0/contact/search", pageQuery(context.propsValue.limit, 0), criteria);
    },
});

const createPerson = createAction({
    auth,
    name: "create_person",
    displayName: "Create person",
    description: "Creates a person contact owned by the connected user.",
    props: {
        lastName: Property.ShortText({ displayName: "Last name", required: true }),
        firstName: Property.ShortText({ displayName: "First name", required: false }),
        email: Property.ShortText({ displayName: "Email", required: false }),
        city: Property.ShortText({ displayName: "City", required: false }),
    },
    run: async (context) => {
        const token = context.auth.access_token;
        const me = await bexioRequest(token, "GET", "/3.0/users/me");
        const userId = typeof me === "object" && me !== null ? Reflect.get(me, "id") : undefined;
        if (typeof userId !== "number") throw new Error("bexio did not return the connected user");
        const { lastName, firstName, email, city } = context.propsValue;
        return bexioRequest(token, "POST", "/2.0/contact", undefined, {
            contact_type_id: PERSON_CONTACT_TYPE,
            name_1: lastName,
            name_2: firstName || undefined,
            mail: email || undefined,
            city: city || undefined,
            user_id: userId,
            owner_id: userId,
        });
    },
});

const listInvoices = createAction({
    auth,
    name: "list_invoices",
    displayName: "List invoices",
    description: "Returns invoices page by page, oldest first.",
    props: {
        limit: Property.Number({ displayName: "Limit", required: false, description: `At most ${MAX_LIMIT}, ${DEFAULT_LIMIT} by default.` }),
        offset: Property.Number({ displayName: "Offset", required: false, description: "Number of invoices to skip." }),
    },
    run: async (context) => bexioRequest(context.auth.access_token, "GET", "/2.0/kb_invoice", { ...pageQuery(context.propsValue.limit, context.propsValue.offset), order_by: "id" }),
});

export const plug = createPlug({
    displayName: "bexio contacts",
    description: "Finds and creates bexio contacts and lists invoices.",
    logoUrl: "https://example.com/bexio-contacts.svg",
    auth,
    minimumSupportedRelease: "0.0.1",
    authors: [],
    actions: [findContacts, createPerson, listInvoices],
    triggers: [],
});
