import { createAction, createPlug, PlugAuth, Property } from "@collabase/plug-framework";

const API_BASE = "https://api.todoist.com/api/v1";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_PAGES = 10;
const MIN_PRIORITY = 1;
const MAX_PRIORITY = 4;

const auth = PlugAuth.OAuth2({
    required: true,
    authUrl: "https://todoist.com/oauth/authorize",
    tokenUrl: "https://todoist.com/oauth/access_token",
    scope: ["data:read_write"],
});

/** Sends one request to the Todoist API; an empty answer (for example after closing a task) returns null. */
async function todoistRequest(token: string, method: "GET" | "POST", path: string, query?: Record<string, string>, body?: unknown): Promise<unknown> {
    const url = new URL(`${API_BASE}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);
    const response = await fetch(url, {
        method,
        headers: { authorization: `Bearer ${token}`, accept: "application/json", ...(body === undefined ? {} : { "content-type": "application/json" }) },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Todoist answered with status ${response.status}`);
    const text = await response.text();
    return text.length > 0 ? JSON.parse(text) : null;
}

/** Follows the cursor of a list endpoint, with an upper bound on the number of pages. */
async function listAll(token: string, path: string): Promise<unknown[]> {
    const items: unknown[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < MAX_PAGES; page += 1) {
        const answer = await todoistRequest(token, "GET", path, cursor ? { cursor } : undefined);
        const results = typeof answer === "object" && answer !== null ? Reflect.get(answer, "results") : undefined;
        const next = typeof answer === "object" && answer !== null ? Reflect.get(answer, "next_cursor") : undefined;
        if (Array.isArray(results)) items.push(...results);
        if (typeof next !== "string" || next.length === 0) break;
        cursor = next;
    }
    return items;
}

const listProjects = createAction({
    auth,
    name: "list_projects",
    displayName: "List projects",
    description: "Returns the active projects with their ids and names.",
    props: {},
    run: async (context) => {
        const projects = await listAll(context.auth.access_token, "/projects");
        return { count: projects.length, projects };
    },
});

const createTask = createAction({
    auth,
    name: "create_task",
    displayName: "Create task",
    description: "Adds a task to a project, or to the inbox when no project is given.",
    props: {
        content: Property.ShortText({ displayName: "Title", required: true }),
        description: Property.LongText({ displayName: "Description", required: false }),
        projectId: Property.ShortText({ displayName: "Project ID", required: false, description: "Leave empty for the inbox." }),
        priority: Property.Number({ displayName: "Priority", required: false, description: `${MIN_PRIORITY} is normal, ${MAX_PRIORITY} is urgent.` }),
        dueString: Property.ShortText({ displayName: "Due", required: false, description: "For example tomorrow 5pm or 2026-12-24." }),
    },
    run: async (context) => {
        const { content, description, projectId, priority, dueString } = context.propsValue;
        if (priority !== undefined && (priority < MIN_PRIORITY || priority > MAX_PRIORITY)) throw new Error(`The priority must be between ${MIN_PRIORITY} and ${MAX_PRIORITY}`);
        return todoistRequest(context.auth.access_token, "POST", "/tasks", undefined, {
            content,
            description: description || undefined,
            project_id: projectId || undefined,
            priority,
            due_string: dueString || undefined,
        });
    },
});

const completeTask = createAction({
    auth,
    name: "complete_task",
    displayName: "Complete task",
    description: "Marks a task as done.",
    props: { taskId: Property.ShortText({ displayName: "Task ID", required: true }) },
    run: async (context) => {
        const taskId = String(context.propsValue.taskId);
        await todoistRequest(context.auth.access_token, "POST", `/tasks/${encodeURIComponent(taskId)}/close`);
        return { taskId, completed: true };
    },
});

export const plug = createPlug({
    displayName: "Todoist tasks",
    description: "Lists Todoist projects, creates tasks and marks them done.",
    logoUrl: "https://example.com/todoist-tasks.svg",
    auth,
    minimumSupportedRelease: "0.0.1",
    authors: [],
    actions: [listProjects, createTask, completeTask],
    triggers: [],
});
