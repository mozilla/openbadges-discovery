discovery
=========

Discovery tool for Open Badges

## Quick Start

```shell
npm install
COOKIE_SECRET=macadamianuts node app
```

Then navigate to http://localhost:3000.

This app can also be easily [deployed to Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-your-application-to-heroku).

## Configuration

Available parameters are:

* COOKIE_SECRET: **required** Should be a large, unguessable string.
* PORT: *optional* Port the server will run on. Defaults to 3000.
* DEV: *optional* Run in development mode. Defaults to false.

Configuration parameters can be provided via commandline arguments, a `config.json` file, or environment variables.

For example, ```node app --cookieSecret=macadamianuts``` or adding a `config.json` with the contents:

```json
{
  "cookie": {
    "secret": "macadamianuts"
  }
}
```

are equivalent to using an environment parameter as shown in the quick start.

See [js-config-store](https://github.com/andrewhayward/js-config-store#config-store) for more information.

## Developers

### Precommit Hooks

At the moment this project is using [precommit-hook](https://github.com/nlf/precommit-hook) to run `jshint` and tests
before commits. Feel free to propose changes to the jshint configuration; it is by no means final.

### Development Mode

Development mode can be enabled to rebuild CSS, recompile templates and rebuild the clientside JS, unminified, on each
request. 

This should **NOT** be turned on for production.

