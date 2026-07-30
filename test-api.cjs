const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('https://www.sankavollerei.web.id/comic/shinigami/home');
    console.log(JSON.stringify(res.data).substring(0, 500));
  } catch(e) { console.error(e.message); }
}
test();
