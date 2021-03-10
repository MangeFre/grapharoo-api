const app = require('../app');
const port = 7777;
const server = app.listen(port, () => {
	console.log(`Testing server listening on ${port}`);
});
