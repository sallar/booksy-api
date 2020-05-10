# Booksy API

## Prerequisites

Create a [Vercel](https://vercel.com) project, and set the following environment variables:

- `AUTH0_KEY` base64 encoded auth0 signing key
- `FAUNA_ADMIN_SECRET` FaunaDB admin secret 123

## Development

Run `now env pull` to download environment variables, and then:

```sh
now dev
```

The API will be available at [http://localhost:3000](localhost:3000)

## Deployment

```sh
now
```
