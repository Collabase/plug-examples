# HTTP with configuration

An action that calls a path below a base URL the user configures, with an API key as bearer token. Shows a custom connection with validation and a request timeout.

## Configuration

- Connection: `baseUrl` (https only) and `apiKey`.
- Action: `method`, `path` and an optional JSON `body`.
- The key is read from the connection and never written to the output.

## Build

```
collabase-plug build .
```

The package is written to `dist/`. Upload it with `collabase-plug publish`.
