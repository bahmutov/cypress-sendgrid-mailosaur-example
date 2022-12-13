# cypress-sendgrid-mailosaur-example
> Sending and testing email flows examples

## Prerequisites

SendGrid account with API key and a verified email sender, see [this doc](https://sendgrid.com/docs/for-developers/sending-email/quickstart-nodejs/)

## Install

```shell
$ npm install
```

## Run

Start the server locally with injected `SENDGRID_API_KEY` and `SENDGRID_FROM` environment variables.

```
SENDGRID_API_KEY=... SENDGRID_FROM=... npm start
```

**Tip:** use [as-a](https://github.com/bahmutov/as-a) utility. Put the environment variables into `.as-a.ini` file and give it the same section name as the folder name.

```ini
; http://github.com/bahmutov/as-a
[cypress-sendgrid-mailosaur-example]
SENDGRID_API_KEY=...
SENDGRID_FROM=...
```

```shell
$ as-a . npm start
```
