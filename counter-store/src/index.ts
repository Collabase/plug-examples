import { createAction, createPlug, PlugAuth, Property, StoreScope } from "@collabase/plug-framework";

const increment = createAction({
    name: "increment",
    displayName: "Increment counter",
    description: "Adds to a named counter and returns the new value. Counters are kept per flow.",
    props: {
        key: Property.ShortText({ displayName: "Counter name", required: true, defaultValue: "runs" }),
        step: Property.Number({ displayName: "Step", required: false, defaultValue: 1 }),
    },
    run: async (context) => {
        const key = `counter:${String(context.propsValue.key)}`;
        const previous = (await context.store.get(key, StoreScope.FLOW)) ?? 0;
        const value = Number(previous) + Number(context.propsValue.step ?? 1);
        await context.store.put(key, value, StoreScope.FLOW);
        return { key: context.propsValue.key, previous: Number(previous), value };
    },
});

const reset = createAction({
    name: "reset",
    displayName: "Reset counter",
    description: "Deletes a named counter.",
    props: { key: Property.ShortText({ displayName: "Counter name", required: true, defaultValue: "runs" }) },
    run: async (context) => {
        await context.store.delete(`counter:${String(context.propsValue.key)}`, StoreScope.FLOW);
        return { key: context.propsValue.key, value: 0 };
    },
});

export const plug = createPlug({
    displayName: "Counter store",
    description: "Counters that survive between runs of a flow.",
    logoUrl: "https://example.com/counter-store.svg",
    auth: PlugAuth.None(),
    minimumSupportedRelease: "0.0.1",
    authors: [],
    actions: [increment, reset],
    triggers: [],
});
