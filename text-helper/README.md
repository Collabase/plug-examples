# Text helper

Three actions: slugify a text, trim whitespace, and extract matches of a regular expression. No connection needed.

## Configuration

- Slugify: `text`, optional `maxLength`. Example: "Grüezi Welt!" gives `gruezi-welt`.
- Trim: `text`.
- Extract: `text` and a `pattern` such as `INV-(\d+)`; returns each match and its first group.

## Build

```
collabase-plug build .
```

The package is written to `dist/`. Upload it with `collabase-plug publish`.
