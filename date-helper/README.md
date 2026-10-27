# Date helper

Format a date for a locale, add or subtract a duration, and compute the difference between two dates. No connection needed.

## Configuration

- Format: `date`, `locale` (default `de-CH`).
- Add a duration: `date`, `amount`, `unit` (minutes, hours, days, weeks).
- Difference: `from`, `to`, `unit`. Output: `{ milliseconds, value }`.

## Build

```
collabase-plug build .
```

The package is written to `dist/`. Upload it with `collabase-plug publish`.
