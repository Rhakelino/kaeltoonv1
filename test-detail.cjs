const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('https://www.sankavollerei.web.id/comic/shinigami/detail/f166beb7-67d8-47ea-9fa2-54aea1df6dd7');
    console.log("Genres: ", JSON.stringify(res.data.data.genres));
    console.log("Chapters length: ", res.data.data.chapters ? res.data.data.chapters.length : 0);
  } catch(e) { console.error(e.message); }
}
test();
