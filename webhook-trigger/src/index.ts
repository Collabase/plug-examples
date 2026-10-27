import { createPlug, createTrigger, PlugAuth, Property, TriggerStrategy } from "@collabase/plug-framework";

const SAMPLE = { event: "order.created", id: "A-1001", total: 129.9, currency: "CHF" };

const incoming = createTrigger({
    name: "incoming_event",
    displayName: "Incoming event",
    description: "Starts the flow when a JSON body is posted to the webhook address.",
    type: TriggerStrategy.WEBHOOK,
    props: {
        eventFilter: Property.ShortText({ displayName: "Event name", required: false, description: "Only start for payloads whose `event` field equals this value." }),
    },
    sampleData: SAMPLE,
    onEnable: async () => {
        // Nothing to register: the sender is configured with the webhook address by hand.
    },
    onDisable: async () => {
        // Nothing to unregister.
    },
    run: async (context) => {
        const body = context.payload.body;
        if (typeof body !== "object" || body === null) return [];
        const filter = context.propsValue.eventFilter;
        if (filter && Reflect.get(body, "event") !== filter) return [];
        return [body];
    },
});

export const plug = createPlug({
    displayName: "Webhook trigger",
    description: "Accepts events posted by another system.",
    logoUrl: "https://example.com/webhook-trigger.svg",
    auth: PlugAuth.None(),
    minimumSupportedRelease: "0.0.1",
    authors: [],
    actions: [],
    triggers: [incoming],
});
