# Known API endpoints

This document lists known API endpoints. It is intended for maintainers, but
is also useful for those who wish to call Duolingo APIs directly themselves.

* All endpoints are `GET` unless otherwise noted.
* All endpoints return JSON (`application/json; charset=utf-8`) unless
  otherwise noted.
* URLs and headers listed below use `${}` notation for parameters, not
  literal dollar signs and braces.

## Unauthenticated

These endpoints do not require any special headers.

### `https://www.duolingo.com/2017-06-30/config`

Mock: [config.json](../mocks/config.json)

* Returns global information about Duolingo.
* The `courses` field describes available languages, but with ids only. The
  keys are the native languages, and the array lists the available languages.

### `https://www.duolingo.com/users/${USERNAME}`

Mock: [users-unauth.json](../mocks/users-unauth.json)

* Returns a lot of information about a user; consider caching.
* This endpoint returns more information if you are logged-in as this user.
* User id is found in `id` field. (Many endpoints use ids instead of names.)
* `ui_language` field is the language id of the user's native language.
* `learning_language` field is the language id of the user's active language.
* `languages` field has information about all languages available for your
  native language, even if you have not started them.
* `language_data` field only has a single child object for the active
  language. This child object has a lot of information.
  * If this is your user, you may want to call this endpoint once for
    every language (by cycling your active language).
  * `skills.*.known_lexemes` has ids for learned lexemes.
  * `skills.*.progress_v3_debug_info.lexeme_ids_by_lessons.*` has ids for all
    lexemes in the course, regardless of their progress.
  * `skills.*.words` is missing some lexemes.

If you just want to get generic Duolingo information (e.g. `languages`), but
for some reason you don't want to use your own user, username `Luis` is the
CEO. 😜

### `http://d2.duolingo.com/api/1/dictionary/hints/${TO}/${FROM}`

Mocks: [hints-token.json](../mocks/hints-token.json),
       [hints-tokens.json](../mocks/hints-tokens.json),
       [hints-sentence.json](../mocks/hints-sentence.json)

* Different host, doesn't require HTTPS.
* `TO` and `FROM` are language ids, e.g. `en` or `es`.
* Requires exactly one of the following query parameters:
  * `token`: A single lexeme to translate, e.g. `one`. Note that a lexeme
    may include multiple words, e.g. `elder brother`.
  * `tokens`: A JSON array of independent lexemes to translate in a batch,
    e.g. `["one","two"]`.
  * `sentence`: A sentence or phrase to provide translation hints for, e.g.
    `one fish`. (This is probably not useful.)

### `https://www.duolingo.com/api/1/dictionary_page`

Mock: [dictionary_page.json](../mocks/dictionary_page.json)

* Requires query parameter `lexeme_id`.
* Returns translations and sample sentences for a lexeme.

### `https://www.duolingo.com/login`

* `POST` with a JSON containing `login` and `password` fields.
* Will return `200` even on rejected password; check for `failure` field.
* JWT is found in `jwt` response header.
* User id is found in `user_id` field. (Many endpoints use ids instead of
  names.)

## Authenticated

These endpoints require the following headers:

* `Authorization: Bearer ${JWT}` where `JWT` is retrieved from login endpoint
  above.

The login endpoint also sets cookies, but these do not seem to be needed.
(One of the cookies just holds the JWT anyway.)

### `https://www.duolingo.com/2017-06-30/users/${USER_ID}`

Mock: [users-auth.json](../mocks/users-auth.json)

* Requires query parameter `fields`, which is a comma-separated list of
  fields to include in the response (response shaping). Passing `*` will
  return all fields.
* This is a much more concise endpoint compared to unauthenticated users.
* The `courses` field only includes languages the user has started, unlike
  the unauthenticated endpoint.
* This endpoint returns more information if you are logged-in as this user.
  * If logged-in, the `skills` field is available.

### `https://www.duolingo.com/2017-06-30/users?username=${USERNAME}`

Mock: [users-auth.json](../mocks/users-auth.json)

* This is identical to the previous endpoint, but allows querying by name
  instead of id.
* Oddly, this version does _not_ require the `fields` query parameter.

### `https://www.duolingo.com/2017-06-30/users/${USER_ID}/subscriptions`

Mock: [subscriptions.json](../mocks/subscriptions.json)

* This returns leaderboard information, including weekly, monthly and total
  xp for the followed users. Unlike the leaderboard widget, this endpoint
  does not include the user's own xp.

### `https://www.duolingo.com/api/1/store/get_items`

Mock: [get_items.json](../mocks/get_items.json)

* Returns information about items that can be purchased.

### `https://www.duolingo.com/2017-06-30/shop-items`

Mock: [shop_items.json](../mocks/shop_items.json)

* Returns information about items that can be purchased.
* This has a different format than the previous endpoint.

### `https://www.duolingo.com/2017-06-30/users/${USER_ID}/purchase-store-item`

Mock: [purchase_store_item.json](../mocks/purchase_store_item.json)

* `POST` with a JSON containing `learningLanguage` and `name` fields.
* `learningLanguage` is not required for all items (e.g. `streak_freeze`).
* Purchases an item from the store for the user.
* On failure, returns `400` with an `error` field in JSON body.
  * `error` is `ALREADY_HAVE_STORE_ITEM` if already have the item.

### `https://www.duolingo.com/vocabulary/overview`

Mock: [vocabulary.json](../mocks/vocabulary.json)

* Returns information about your active language.
* `vocab_overview` has the lexemes that you have learned.

### `https://www.duolingo.com/api/1/skills/show`

Mock: [skills.json](../mocks/skills.json)

* Requires query parameter `id` which is a skill id.
* Returns information about a skill, including words.
