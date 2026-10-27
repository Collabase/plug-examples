# Collabase plug examples

Small plugs that show how the plug framework is used. Each folder is a complete plug package.

- `bexio-contacts`: Find and create bexio contacts and list invoices with an OAuth2 connection.
- `counter-store`: Count up a named counter in the flow store.
- `date-helper`: Format dates, add durations and compute differences.
- `http-with-config`: Call a configurable base URL with an API key.
- `math-helper`: Sum, average and round a list of numbers.
- `polling-trigger`: Report new entries of a public JSON feed.
- `text-helper`: Slugify, trim and extract text.
- `todoist-tasks`: List Todoist projects, create tasks and mark them done with an OAuth2 connection.
- `webhook-trigger`: Start a flow from an incoming webhook.

## Build an example

Build the Collabase Plug SDK first, then run its tool on an example folder:

```
node <sdk>/dist/collabase-plug.mjs build <example>
```

The package is written to `<example>/dist/`.

## Authorship and ownership

All code in Collabase and in this repository up to and including the v1.0.0 release is the private work
of Brian Trepto.

Work created after v1.0.0 is created in collaboration with Infometis AG. Who owns that later work has not
been settled yet. Until it is, a contribution made after v1.0.0 is not licensed beyond what the
`LICENSE` file of this repository states, and nobody should assume otherwise.

## Licence

MIT, see `LICENSE`. Two examples are adapted from MIT licensed community plugs, see `NOTICE`.
