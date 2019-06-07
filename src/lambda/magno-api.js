import lime from "./lib/lime.js";
import eztv from "./lib/eztv.js";

export function handler(event, context, callback) {
  const searchStr = event.queryStringParameters["q"];

  Promise.all([lime.search(searchStr), eztv.search(searchStr)])
    .then(results => {
      console.log(results);

      const allResults = [].concat(...results);
      const sortedResults = allResults.sort((a, b) => b.seeds - a.seeds);

      callback(null, {
        contentType: "text/json",
        statusCode: 200,
        body: JSON.stringify(sortedResults),
      });
    })
    .catch(error => console.log(`error ${error}`));
}
