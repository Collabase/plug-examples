# Counter store

Increments a named counter that is kept in the flow store between runs. Shows `context.store` with a scope. No connection needed.

## Configuration

- Increment: `key` and `step`. Output: `{ key, previous, value }`.
- Reset: `key`.

## Build

```
collabase-plug build .
```

The package is written to `dist/`. Upload it with `collabase-plug publish`.
