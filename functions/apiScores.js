const AWS = require('aws-sdk');
const randomBytes = require('crypto').randomBytes;
const ddb = new AWS.DynamoDB.DocumentClient();
const {
  getGameIdFromApiKey,
  defaultResponseHeaders,
  toUrlString,
  scoreCreate,
} = require('../helpers');

exports.handler = async (event, _context, callback) => {
  const sourceIp = event?.requestContext?.identity?.sourceIp;
  const { httpMethod: method, stage } = event?.requestContext;
  const { 'x-api-key': apiKey } = event.headers;
  const gameId = await getGameIdFromApiKey(apiKey, sourceIp, stage, ddb);
  if (!gameId || !['POST', 'GET'].includes(method)) {
    return callback(null, {
      statusCode: 400,
      headers: defaultResponseHeaders,
      body: JSON.stringify({
        success: false,
        error: 'API key is faulty or game is inactive.',
      }),
    });
  }
  switch (method) {
    case 'GET':
      // Get scores
      const { 'x-last-fetch-key': lastFetchKey } = event.headers;
      const limit = 25;
      const TableName = `${stage}-MMS_SCORES`;
      let scores = [];
      const params = {
        TableName,
        IndexName: 'gameIdIndex',
        ScanIndexForward: false, // DESC
        KeyConditionExpression: 'gameId = :gameId',
        ExpressionAttributeValues: {
          ':gameId': gameId,
        },
        Limit: 25,
        QueryPageSize: 25,
      };
      if (!!lastFetchKey && lastFetchKey !== 'null') {
        params.ExclusiveStartKey = JSON.parse(lastFetchKey);
      }
      await ddb
        .query(params)
        .promise()
        .then((data) => {
          scores = data.Items;
          nextFetchKey = data.LastEvaluatedKey;
        })
        .catch((err) => {
          console.error('Scores API Error: ', err);
        });
      return callback(null, {
        statusCode: 200,
        headers: defaultResponseHeaders,
        body: JSON.stringify({
          scores,
          nextFetchKey,
        }),
      });
    case 'POST':
      // post a score
      const requestBody = JSON.parse(event.body);
      const { name, score } = requestBody;
      const scoreId = toUrlString(randomBytes(32));
      const validBody = name && score && !isNaN(score) && name.length > 0;
      if (!validBody) {
        return callback(null, {
          statusCode: 400,
          headers: defaultResponseHeaders,
          body: JSON.stringify({
            success: false,
            error: 'Required field missing or misconfigured',
          }),
        });
      }
      const scoreNum = parseInt(score);
      await scoreCreate(scoreId, gameId, name, scoreNum, stage, ddb);
      return callback(null, {
        statusCode: 201,
        headers: defaultResponseHeaders,
        body: JSON.stringify({
          scoreId,
          gameId,
          name,
          score: scoreNum,
        }),
      });
    default:
      return callback(null, {
        statusCode: 400,
        headers: defaultResponseHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Something went wrong.',
        }),
      });
  }
};
