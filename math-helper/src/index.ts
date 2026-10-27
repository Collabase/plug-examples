import { createAction, createPlug, PlugAuth, Property } from "@collabase/plug-framework";

function numbers(values: unknown): number[] {
    if (!Array.isArray(values)) throw new Error("The values must be a list");
    const parsed = values.map((value) => Number(value));
    if (parsed.length === 0 || parsed.some((value) => Number.isNaN(value))) throw new Error("The list must hold at least one number and nothing else");
    return parsed;
}

const valuesProp = Property.Array({ displayName: "Values", required: true, description: "One number per entry." });

const sum = createAction({
    name: "sum",
    displayName: "Sum",
    description: "Adds up a list of numbers.",
    props: { values: valuesProp },
    run: async (context) => {
        const list = numbers(context.propsValue.values);
        return { count: list.length, sum: list.reduce((total, value) => total + value, 0) };
    },
});

const average = createAction({
    name: "average",
    displayName: "Average",
    description: "Returns the mean, the smallest and the largest number.",
    props: { values: valuesProp },
    run: async (context) => {
        const list = numbers(context.propsValue.values);
        return { average: list.reduce((total, value) => total + value, 0) / list.length, min: Math.min(...list), max: Math.max(...list) };
    },
});

const round = createAction({
    name: "round",
    displayName: "Round",
    description: "Rounds a number to a number of decimals.",
    props: {
        value: Property.Number({ displayName: "Value", required: true }),
        decimals: Property.Number({ displayName: "Decimals", required: false, defaultValue: 2 }),
    },
    run: async (context) => {
        const factor = 10 ** Number(context.propsValue.decimals ?? 2);
        return { value: Math.round(Number(context.propsValue.value) * factor) / factor };
    },
});

export const plug = createPlug({
    displayName: "Math helper",
    description: "Sum, average and round numbers.",
    logoUrl: "https://example.com/math-helper.svg",
    auth: PlugAuth.None(),
    minimumSupportedRelease: "0.0.1",
    authors: [],
    actions: [sum, average, round],
    triggers: [],
});
