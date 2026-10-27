# Webhook trigger

A trigger that starts a flow when another system posts JSON to the webhook address. Shows `onEnable`, `onDisable`, sample data and filtering in `run`.

## Configuration

- `eventFilter` (optional): only payloads whose `event` field equals this value start the flow.
- Post a JSON body to the webhook address shown for the trigger in the flow editor.

## Build

```
collabase-plug build .
```

The package is written to `dist/`. Upload it with `collabase-plug publish`.
