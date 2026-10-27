# Todoist tasks

Lists Todoist projects, creates tasks and marks them done. Shows an OAuth2 connection and cursor paging with an upper bound.

## Configuration

- Connection: OAuth2 with the scope `data:read_write`. You register an app in Todoist and enter its client id and secret in the Collabase connection.
- Actions: `list_projects`, `create_task` (title, description, project, priority, due text) and `complete_task`.
- The access token is read from the connection and never written to the output.

## Build

```
collabase-plug build .
```

The package is written to `dist/`. Upload it with `collabase-plug publish`.
