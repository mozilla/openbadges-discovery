discovery
=========

Discovery tool for Open Badges

## Quick Start

Assuming a neo4j database...

```bash
npm install
echo '{  
  "url": "http://localhost:3000",
  "cookie": {
    "secret": "macadamianuts"
  },
  "neo4j_url": "http://localhost:7474"
}' > config.json
DEV=1 node app
```

Then navigate to http://localhost:3000.

This app can also be [deployed to Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-your-application-to-heroku).

## Configuration

### Parameters

Available app parameters are:

* COOKIE_SECRET: **required** Should be a large, unguessable string.
* URL: **required** The url (protocol, host, port) where your app lives. This is used as the Persona audience, and must match what you see in your browser's url bar exactly.
* PORT: *optional* Port the server will run on. Defaults to 3000.
* DEV: *optional* Run in development mode. Defaults to false.
* NEO4J_URL: *optional* The neo4j database url to use. Defaults to http://localhost:7474.

### Alternatives

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

### Database Setup

Currently some one-time database setup can be accomplished by running `bin/db-setup`. This will probably need
to be replaced eventually with a more robust migration tactic of some sort, despite the fact that neo4j is more
or less schema-less.

### Precommit Hooks

At the moment this project is using [precommit-hook](https://github.com/nlf/precommit-hook) to run `jshint` and tests
before commits. Feel free to propose changes to the jshint configuration; it is by no means final.

### Development Mode

Development mode can be enabled to rebuild CSS, recompile templates and rebuild the clientside JS, unminified, on each
request. 

This should **NOT** be turned on for production.

