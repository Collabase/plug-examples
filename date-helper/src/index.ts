import { createAction, createPlug, PlugAuth, Property } from "@collabase/plug-framework";

const UNIT_MS: Record<string, number> = { minutes: 60_000, hours: 3_600_000, days: 86_400_000, weeks: 604_800_000 };

const unitOptions = { options: Object.keys(UNIT_MS).map((unit) => ({ label: unit, value: unit })) };

function parse(value: unknown): Date {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) throw new Error(`Not a valid date: ${String(value)}`);
    return date;
}

const format = createAction({
    name: "format_date",
    displayName: "Format date",
    description: "Formats a date for a locale, for example de-CH.",
    props: {
        date: Property.DateTime({ displayName: "Date", required: true }),
        locale: Property.ShortText({ displayName: "Locale", required: true, defaultValue: "de-CH" }),
    },
    run: async (context) => {
        const date = parse(context.propsValue.date);
        return { iso: date.toISOString(), formatted: new Intl.DateTimeFormat(String(context.propsValue.locale), { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }).format(date) };
    },
});

const add = createAction({
    name: "add_duration",
    displayName: "Add a duration",
    description: "Adds or subtracts an amount of time.",
    props: {
        date: Property.DateTime({ displayName: "Date", required: true }),
        amount: Property.Number({ displayName: "Amount", required: true, description: "Negative values go back in time." }),
        unit: Property.StaticDropdown({ displayName: "Unit", required: true, defaultValue: "days", options: unitOptions }),
    },
    run: async (context) => {
        const { date, amount, unit } = context.propsValue;
        const result = new Date(parse(date).getTime() + Number(amount) * (UNIT_MS[String(unit)] ?? 0));
        return { iso: result.toISOString() };
    },
});

const difference = createAction({
    name: "date_difference",
    displayName: "Difference between dates",
    description: "Returns the time between two dates in the chosen unit.",
    props: {
        from: Property.DateTime({ displayName: "From", required: true }),
        to: Property.DateTime({ displayName: "To", required: true }),
        unit: Property.StaticDropdown({ displayName: "Unit", required: true, defaultValue: "days", options: unitOptions }),
    },
    run: async (context) => {
        const { from, to, unit } = context.propsValue;
        const milliseconds = parse(to).getTime() - parse(from).getTime();
        return { milliseconds, value: milliseconds / (UNIT_MS[String(unit)] ?? 1) };
    },
});

export const plug = createPlug({
    displayName: "Date helper",
    description: "Format dates, add durations and compute differences.",
    logoUrl: "https://example.com/date-helper.svg",
    auth: PlugAuth.None(),
    minimumSupportedRelease: "0.0.1",
    authors: [],
    actions: [format, add, difference],
    triggers: [],
});
