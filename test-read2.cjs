const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('https://www.sankavollerei.web.id/comic/shinigami/read/4fc79ab6-1375-442b-a381-5e49c9ae223b');
    console.log("Keys in data:", Object.keys(res.data.data));
    console.log("Images array:", Array.isArray(res.data.data.images));
    console.log("Pages array:", Array.isArray(res.data.data.pages));
  } catch(e) { console.error(e.message); }
}
test();