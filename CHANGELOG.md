### 2.1.0

#### DuolingoClient

The underlying API call for `getCourseSkills` now requires authentication and
the client will now require login and pass the headers.

### 2.0.0 (2019-04-18)

Breaking changes were made to better support courses that have non-English
native/UI languages. These changes also include a better distinction
between courses and languages.

#### DuolingoClient

Added `getCourses`, `setCurrentCourse`.

`getUser` changes:
* `streak.length` is now just `streak`. Other streak fields are no longer
   available.
* `activeLanguage` is replaced by `currentCourseId`
* `languages` is replaced by `courses`. Course title and user level are no
  longer available.

`getLanguage` is replaced by `getCourseSkills`:
* This takes a course id instead of a language id, e.g. `DUOLINGO_ES_EN`
  instead of `es`.
* If a username is omitted, then the logged-in user will be used.
* This only returns the `skills` array. Other course information can be found
  with `getCourses`.
* Added `urlTitle` property to skills.

`getSkill` is replaced by `getSkillWords`:
* This only returns the `words` array. Other skill information can be found
  with `getCourseSkills`.

`translate` changes:
* Takes a course id instead of two language ids.
* Also fixed a bug where the language ids were reversed.

### 1.0.0 (2019-04-14)

Initial release.
