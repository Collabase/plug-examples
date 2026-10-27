# bexio contacts

Finds and creates contacts in bexio and lists invoices. Shows an OAuth2 connection with a validation call.

## Configuration

- Connection: OAuth2. You register an app in bexio and enter its client id and secret in the Collabase connection. The scopes are `contact_show`, `contact_edit` and `kb_invoice_show`.
- Actions: `find_contacts` (search by email, name or city), `create_person` and `list_invoices` (paged).
- The access token is read from the connection and never written to the output.

## Build

```
collabase-plug build .
```

The package is written to `dist/`. Upload it with `collabase-plug publish`.
