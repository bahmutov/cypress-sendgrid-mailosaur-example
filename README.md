# cypress-sendgrid-mailosaur-example ![cypress version](https://img.shields.io/badge/cypress-12.1.0-brightgreen)

> Sending and testing email flows example

- Sending emails via Sendgrid
- Fetching sent emails using [cypress-mailosaur](https://github.com/mailosaur/cypress-mailosaur)
- End-to-end testing using Cypress

![Confirmation code email](./images/email.png)

## Prerequisites

SendGrid account with API key and a verified email sender, see [this doc](https://sendgrid.com/docs/for-developers/sending-email/quickstart-nodejs/). Similarly you need Mailosaur server ID and API key.

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
; sending emails
SENDGRID_API_KEY=...
SENDGRID_FROM=...
; checking emails
CYPRESS_MAILOSAUR_SERVER_ID=...
CYPRESS_MAILOSAUR_API_KEY=...
```

Start the local application and open Cypress using [start-server-and-test](https://github.com/bahmutov/start-server-and-test) utility

```text
$ as-a . npm run local
```

## See also

- 💻 [Full End-to-End Testing for Your HTML Email Workflows](https://slides.com/bahmutov/email-testing) presentation
- 📝 [Testing email flows with Mailosaur](https://filiphric.com/testing-email-flows-with-mailosaur)
