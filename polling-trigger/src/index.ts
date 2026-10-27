import { createPlug, createTrigger, PlugAuth, Property, TriggerStrategy } from "@collabase/plug-framework";

const LAST_SEEN = "lastSeenId";
const FETCH_TIMEOUT_MS = 10_000;
const SAMPLE = { id: 42, title: "Release notes", url: "https://example.com/news/42" };

async function fetchEntries(feedUrl: string): Promise<{ id: number }[]> {
    const response = await fetch(feedUrl, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`The feed answered with status ${response.status}`);
    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new Error("The feed must be a JSON list");
    return body.filter((entry): entry is { id: number } => typeof entry === "object" && entry !== null && typeof Reflect.get(entry, "id") === "number");
}

const newEntries = createTrigger({
    name: "new_entries",
    displayName: "New feed entries",
    description: "Checks a JSON feed on a schedule and returns the entries with an id above the last one seen.",
    type: TriggerStrategy.POLLING,
    props: { feedUrl: Property.ShortText({ displayName: "Feed URL", required: true, description: "Must return a JSON list of objects with a numeric `id`." }) },
    sampleData: SAMPLE,
    onEnable: async (context) => {
        const entries = await fetchEntries(String(context.propsValue.feedUrl));
        await context.store.put(LAST_SEEN, Math.max(0, ...entries.map((entry) => entry.id)));
    },
    onDisable: async (context) => {
        await context.store.delete(LAST_SEEN);
    },
    run: async (context) => {
        const lastSeen = Number((await context.store.get(LAST_SEEN)) ?? 0);
        const fresh = (await fetchEntries(String(context.propsValue.feedUrl))).filter((entry) => entry.id > lastSeen).sort((a, b) => a.id - b.id);
        if (fresh.length > 0) await context.store.put(LAST_SEEN, fresh[fresh.length - 1]?.id ?? lastSeen);
        return fresh;
    },
    test: async (context) => (await fetchEntries(String(context.propsValue.feedUrl))).slice(0, 5),
});

export const plug = createPlug({
    displayName: "Polling trigger",
    description: "Reports new entries of a public JSON feed.",
    logoUrl: "https://example.com/polling-trigger.svg",
    auth: PlugAuth.None(),
    minimumSupportedRelease: "0.0.1",
    authors: [],
    actions: [],
    triggers: [newEntries],
});
