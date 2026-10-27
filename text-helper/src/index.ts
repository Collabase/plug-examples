import { createAction, createPlug, PlugAuth, Property } from "@collabase/plug-framework";

const slugify = createAction({
    name: "slugify",
    displayName: "Slugify",
    description: "Turns a text into a lower case slug with dashes.",
    props: {
        text: Property.ShortText({ displayName: "Text", required: true }),
        maxLength: Property.Number({ displayName: "Maximum length", required: false, defaultValue: 60 }),
    },
    run: async (context) => {
        const { text, maxLength } = context.propsValue;
        const slug = String(text)
            .normalize("NFKD")
            .replace(/[̀-ͯ]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, Number(maxLength ?? 60));
        return { slug };
    },
});

const trim = createAction({
    name: "trim",
    displayName: "Trim",
    description: "Removes surrounding whitespace and collapses runs of blanks.",
    props: { text: Property.LongText({ displayName: "Text", required: true }) },
    run: async (context) => ({ text: String(context.propsValue.text).trim().replace(/[ \t]+/g, " ") }),
});

const extract = createAction({
    name: "extract",
    displayName: "Extract with a pattern",
    description: "Returns every match of a regular expression and its first group.",
    props: {
        text: Property.LongText({ displayName: "Text", required: true }),
        pattern: Property.ShortText({ displayName: "Pattern", required: true, description: "A JavaScript regular expression without the slashes." }),
    },
    run: async (context) => {
        const matches = [...String(context.propsValue.text).matchAll(new RegExp(String(context.propsValue.pattern), "g"))];
        return { count: matches.length, matches: matches.map((match) => ({ value: match[0], group: match[1] ?? null })) };
    },
});

export const plug = createPlug({
    displayName: "Text helper",
    description: "Small text utilities.",
    logoUrl: "https://example.com/text-helper.svg",
    auth: PlugAuth.None(),
    minimumSupportedRelease: "0.0.1",
    authors: [],
    actions: [slugify, trim, extract],
    triggers: [],
});
