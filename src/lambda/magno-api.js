var fetch = require("node-fetch");
var encode = require("base-64").encode;
const dotenv = require("dotenv");

dotenv.config();

const { API_U, API_P } = process.env;

export function handler(event, context, callback) {
  const searchStr = event.queryStringParameters["q"];

  fetch(`https://chill.institute/api/v1/search?keyword=${searchStr}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encode(`${API_U}:${API_P}`)}`,
    },
  })
    .then(res => res.json())
    .then(results => {
      console.log("Results from magno-api 👇");
      console.log(results);
      console.log("");
      const allResults = [].concat(...results);
      const sortedResults = allResults.sort((a, b) => b.peers - a.peers);

      callback(null, {
        contentType: "text/json",
        statusCode: 200,
        body: JSON.stringify(sortedResults),
      });
    })
    .catch(error => console.log(`error ${error}`));
}
