const axios = require('axios');
async function test() {
  try {
    const res2 = await axios.get('https://www.sankavollerei.web.id/comic/shinigami/chapters/f166beb7-67d8-47ea-9fa2-54aea1df6dd7');
    console.log("Chapter list length:", res2.data.data ? res2.data.data.length : 0);
    if(res2.data.data && res2.data.data.length > 0) {
       console.log("First chapter:", res2.data.data[0]);
    }
  } catch(e) { console.error(e.message); }
}
test();
