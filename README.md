# duolingo-client

An unofficial [Duolingo](https://www.duolingo.com) client for JavaScript.

[![npm Release](https://img.shields.io/npm/v/duolingo-client.svg?style=flat)](https://www.npmjs.com/package/duolingo-client)
[![Build Status](https://travis-ci.com/okorz001/duolingo-client.svg?branch=master)](https://travis-ci.com/okorz001/duolingo-client)

## Requirements

duolingo-client requires node >= 7.6.0 for async/await. To use
duolingo-client on older versions of node, you must use a transpiler.

In theory, duolingo-client will run in any browser that supports
async/await. However, the Duolingo APIs do not support CORS, so in practice
it is not very useful in a browser.

## Install

duolingo-client is published to npm.

```sh
$ npm install duolingo-client
```

## Documentation

JSDoc for master is published after every successful build to
[GitHub Pages](https://okorz001.github.io/duolingo-client/).
