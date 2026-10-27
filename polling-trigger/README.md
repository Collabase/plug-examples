# Polling trigger

A trigger that checks a public JSON feed and returns entries with a higher id than the last one seen. Shows a polling trigger with state in the store and a request timeout.

## Configuration

- `feedUrl`: a URL that returns a JSON list of objects with a numeric `id`.
- No secrets. The structure is checked by the build; the feed itself is not called at build time.

## Build

```
collabase-plug build .
```

The package is written to `dist/`. Upload it with `collabase-plug publish`.
