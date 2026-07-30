const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('https://www.sankavollerei.web.id/comic/shinigami/read/4fc79ab6-1375-442b-a381-5e49c9ae223b');
    console.log("Read payload:", JSON.stringify(res.data).substring(0, 500));
  } catch(e) { console.error(e.message); }
}
test();
