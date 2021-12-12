# mms-scores

Serverless API for storing &amp; listing scores for web games

## Background/Purpose

Back in the early 2000's I made dozens of Flash games. At the time, I would send POST requests out to a simple PHP script on a server I had at the time. In the intervening years Flash has died (RIP) and development methodologies for addressing highly specific online services like storing and viewing scores for web games have changed dramatically. Recently, I made a few web games in React, and I needed a way to store scores. A microservice using serverless AWS components seemed like an interesting solution.

I had been looking for an excuse to use DynamoDB for some time, and this seemed like a good fit.

## Setting Up

First up, install Serverless globally. Then install the dependencies for the project.

```
npm i -g serverless
npm i
```

To run the service locally, run sls offline. Note that 'sls' is a time-saving alias for 'serverless.'

When the command is run, the output will give you the local endpoint URL for the API, which you can hit with Postman to test.

To deploy the service, run the following:

```
sls deploy
```

For prod, specify the stage and retrieve the info in verbose mode to get the prod endpoint:

```
sls deploy --stage prod
sls info --verbose
```
