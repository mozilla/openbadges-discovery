discovery
=========

Discovery tool for Open Badges

## Quick Start

With mongo running locally...  

```bash
npm install
echo '{  
  "url": "http://localhost:3000",
  "cookie": {
    "secret": "macadamianuts"
  },
  "database": {
    "app": "mongodb://127.0.0.1:27017/app",
    "test": "mongodb://127.0.0.1:27017/test"
  }
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
* DATABASE_APP: Mongo url for your app database
* DATABASE_TEST: Mongo url for your test database

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

are equivalent to setting `COOKIE_SECRET` in the environment.

See [js-config-store](https://github.com/andrewhayward/js-config-store#config-store) for more information.

## Developers

### Data Setup

`app/fake-data.js` is currently defunct. You can run `node app/google-data` to wipe the app database and load in initial
data from a Google spreadsheet as detailed below.

#### Google spreadsheet data

The Google data reader makes many assumptions about the format of the spreadsheet. In general to load data this way:

* set the following configuration:
    * `GOOGLE_EMAIL`: the email address of an account with read access on the spreadsheet
    * `GOOGLE_PASSWARD`: the password for the same account
    * `GOOGLE_KEY`: the spreadsheet key, found in the url
        * e.g. `https://docs.google.com/spreadsheet/ccc?key={THIS IS THE KEY}&usp=drive_web#gid=0` <sup>†</sup>
* build your spreadsheet as follows
    * define your badges using as many sheets as you would like with the following column names
        * `Badge name`: name
        * `Description`: description
        * `Tags`: comma-separated list of tags
        * `Creator`: creator
        * `Image file`: url of badge image
        * `Criteria`: criteria as HTML<sup>‡</sup>
        * `Keeping`: rows with a blank cell here will be skipped
    * define your pathways, one sheet per pathway with the following column names
        * `Name`: name
        * `Description`: description
        * `Image file`: url of pathway image
        * `Tags`: comma-separated list of tags
        * `Creator`: creator
        * `Badge name`: name of badge to include in pathway
        * `X`: x position on grid, starting at 0
        * `Y`: y position on grid, starting at 0
        * `Core`: any value here indicates this badge is core to this pathway
        * `Note title`: title of note
        * `Note body`: body of note
    * on the first line, fill out `Name` through `Creator`
    * for each badge in the pathway, fill out `Badge name` through `Core`
    * for each note in the pathway, fill out `X`, `Y`, `Note title`, and `Note body`
    * make sure all pathway sheets have the word "pathway" in the sheet name

<sup>†</sup> This is an older style of Google spreadsheet url, YMMV on the newer updated style.

<sup>‡</sup> This mimics retreiving the criteria url a badge would normally provide and parsing the content there to retrieve an HTML snippet for display.

### Precommit Hooks

At the moment this project is using [precommit-hook](https://github.com/nlf/precommit-hook) to run `jshint` and tests
before commits. Feel free to propose changes to the jshint configuration; it is by no means final.

It also runs `bin/beautify --warn` which will report files that don't live up to formatting conventions, but currently
*will not fail the validation step.* Run `bin/beautify -h` for a help statement.

### Development Mode

Development mode can be enabled to rebuild CSS, recompile templates and rebuild the clientside JS, unminified, on each
request. 

This should **NOT** be turned on for production.

