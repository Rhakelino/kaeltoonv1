const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('https://www.sankavollerei.web.id/comic/shinigami/chapters/f166beb7-67d8-47ea-9fa2-54aea1df6dd7?page=1');
    console.log("Keys in response:", Object.keys(res.data));
    console.log("Pagination:", res.data.pagination);
  } catch(e) { console.error(e.message); }
}
test();