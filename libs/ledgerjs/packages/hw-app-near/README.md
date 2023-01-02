<img src="https://user-images.githubusercontent.com/211411/34776833-6f1ef4da-f618-11e7-8b13-f0697901d6a8.png" height="100" />

[Github](https://github.com/LedgerHQ/ledgerjs/),
[Ledger Devs Slack](https://ledger-dev.slack.com/)

## @ledgerhq/hw-app-near

Ledger Hardware Wallet NEAR JavaScript bindings.

***

## Are you adding Ledger support to your software wallet?

You may be using this package to communicate with the NEAR Nano App.

For a smooth and quick integration:

*   See the developers’ documentation on the [Developer Portal](https://developers.ledger.com/docs/transport/overview/) and
*   Go on [Discord](https://developers.ledger.com/discord-pro/) to chat with developer support and the developer community.

***

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [Near](#near)
    *   [Parameters](#parameters)
    *   [Examples](#examples)
    *   [getAddress](#getaddress)
        *   [Parameters](#parameters-1)
        *   [Examples](#examples-1)
    *   [signTransaction](#signtransaction)
        *   [Parameters](#parameters-2)

### Near

NEAR API

#### Parameters

*   `transport` **Transport** 

#### Examples

```javascript
import Near from "@ledgerhq/hw-app-near";
const near = new Near(transport)
```

#### getAddress

##### Parameters

*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
*   `verify` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** 

##### Examples

```javascript
near.getAddress("44'/397'/0'/0'/0'", true).then(o => o.address)
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<{publicKey: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), address: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)}>** an object with a publicKey and address

#### signTransaction

##### Parameters

*   `transaction` **[Uint8Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)** 
*   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<([Buffer](https://nodejs.org/api/buffer.html) | [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))>** a signature to be broadcasted to the chain