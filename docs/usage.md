The `duolingo-client` package exposes both a high-level Duolingo API client as
well as some low-level utility functions that can help you call the Duolingo
API directly.

# High-Level Client

The high-level client is exported as the `DuolingoClient` class. This class
handles request creation and response parsing and tries to present a reasonable
data model for the Duolingo.

## Creating a client

Create an instance of `DuolingoClient` to use the Duolingo API.

```js
const {DuolingoClient} = require('duolingo-client')
const client = new DuolingoClient()
// call unauthenticated APIs
```

## Logging in

Some Duolingo APIs require authentication. To call an authenticated API, you
must first login with a valid username and password.

```js
await client.login('username123', 'secret password')
// call authenticated (or unauthenticated) APIs
```

## Logging out

You can discard user credentials by either logging in to a different user or
by using the logout method.

```js
await client.login('username123', 'secret password')
// call authenticated APIs as username 123

await client.login('username456', 'another secret')
// call authenticated APIs as username 456

// this is NOT async because it's not actually an API call.
client.logout()
```

The `DuolingoClient` documentation describes what APIs are available and which
APIs require authentication.

# Low-level Utilities

## getJwt

The `getJwt` function can be used to get a JWT for authenticated API calls.
This is the underlying function for `DuolingoClient.login`.

```js
const {getJwt} = require('duolingo-client')
const JWT = await getJwt('username123', 'secret password')
```

You can call the Duolingo API with any HTTP client by setting the
`Authorization` header with the `Bearer` scheme.

```js
const headers = {Authorization: `Bearer ${JWT}`}
// or
setHeader('Authorization', `Bearer ${JWT}`)
```