var fetch = require("node-fetch");
var encode = require("base-64").encode;
const dotenv = require("dotenv");

dotenv.config();

const { API_U, API_P } = process.env;

exports.handler = function handler(event, context, callback) {
  console.log("process", process.env);
  console.log("event", event);
  if (process.env === "production" && event.referer.host !== "magno.netlify.app") {
    return callback(null, {
      contentType: "text/plain",
      statusCode: 400,
      body: "Naaah mate",
    });
  }

  const searchStr = event.queryStringParameters["term"];

  if (!searchStr) {
    return callback(null, { contentType: "text/plain", statusCode: 400, body: "Naaah mate" });
  }

  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encode(`${API_U}:${API_P}`)}`,
    },
  };

  const urls = [
    `https://chill.institute/api/v1/search?keyword=${searchStr}&indexer=1337x`,
    `https://chill.institute/api/v1/search?keyword=${searchStr}&indexer=rarbg`,
    `https://chill.institute/api/v1/search?keyword=${searchStr}&indexer=yts`,
  ];

  const allRequests = urls.map(url => fetch(url, opts).then(response => response.json()));

  Promise.all(allRequests).then(results => {
    const allResults = [].concat(...results);
    const sortedResults = allResults.sort((a, b) => b.peers - a.peers);

    callback(null, {
      contentType: "text/json",
      statusCode: 200,
      body: JSON.stringify(sortedResults),
    });
  });
};
