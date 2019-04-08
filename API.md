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

* Returns global information about Duolingo.
* The `courses` field describes available languages.

### `https://www.duolingo.com/users/${USERNAME}`

* Returns a lot of information about a user; consider caching.
* This endpoint returns more information if you are logged-in as this user.
* User id is found in `id` field. (Many endpoints use ids instead of names.)
* `language_data` field only has a single child object for the active
  language. This child object has a lot of information.
  * If this is your user, you may want to call this endpoint once for
    every language (by cycling your active language).
  * `skills.*.known_lexemes` has ids for learned lexemes.
  * `skills.*.progress_v3_debug_info.lexeme_ids_by_lessons.*` has ids for all
    lexemes in the course, regardless of their progress.
  * `skills.*.words` is missing some lexemes.

### `http://d2.duolingo.com/api/1/dictionary/hints/${TO}/${FROM}`

* Different host, doesn't require HTTPS.
* `TO` and `FROM` are language ids, e.g. `en` or `es`.
* Requires exactly one of the following query parameters:
  * `token`: A single lexeme to translate, e.g. `one`. Note that a lexeme
    may include multiple words, e.g. `elder brother`.
  * `tokens`: A JSON array of independent lexemes to translate in a batch,
    e.g. `["one","two"]`.
  * `sentence`: A sentence or phrase to provide translation hints for, e.g. `one
    fish`. (This is probably not useful.)

### `https://www.duolingo.com/api/1/dictionary_page`

* Requires query parameter `lexeme_id`.
* Returns translations and sample sentences for a lexeme.

### `https://www.duolingo.com/api/1/skills/show`

* Requires query parameter `id` which is a skill id.
* Returns information about a skill, including words.

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

### `https://www.duolingo.com/2017-06-30/users/${USER_ID}`

### `https://www.duolingo.com/2017-06-30/users/${USER_ID}/subscriptions`

### `https://www.duolingo.com/api/1/store/get_items`

### `https://www.duolingo.com/2017-06-30/shop-items`

### `https://www.duolingo.com/vocabulary/overview`

* Returns information about your active language.
* `vocab_overview` returns lexemes that you have learned.
