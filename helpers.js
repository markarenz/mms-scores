const getGameIdFromApiKey = async (apiKey, sourceIp, stage, ddb) => {
  const TableName = `${stage}-MMS_GAMES`;
  return await ddb
    .query({
      TableName,
      IndexName: 'apiKeyIndex',
      ScanIndexForward: false,
      KeyConditionExpression: 'apiKey = :apiKey',
      ExpressionAttributeValues: {
        ':apiKey': apiKey,
      },
    })
    .promise()
    .then((data) => {
      const game = data.Items[0];
      const { gameId, active, allowedIps } = game;
      const allowedIpsArr = allowedIps.replace(' ', '').split(',');
      const ipAllowed = allowedIpsArr.includes(sourceIp);
      const hasPermission = active && ipAllowed;
      return hasPermission ? gameId : null;
    });
};

const scoreCreate = (scoreId, gameId, name, score, stage, ddb) => {
  const TableName = `${stage}-MMS_SCORES`;
  createdAt = getCurrentDateTime();
  return ddb
    .put({
      TableName,
      Item: { scoreId, gameId, name, score, createdAt },
    })
    .promise();
};

const defaultResponseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Credentials': false,
};

const toUrlString = (buffer) => {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const getCurrentDateTime = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${
    d.getUTCMonth() + 1
  }-${d.getUTCDate()} ${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}`;
};

module.exports = {
  getGameIdFromApiKey,
  scoreCreate,
  defaultResponseHeaders,
  toUrlString,
};
