const express = require('express');
const app = express();
const port = 3000;

// Set Pug as the template engine
app.set('view engine', 'pug');
app.set('views', './views');

// Serve static files (like script.js) from the 'public' folder
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`♟️ Dumb Chess running at http://localhost:${port}`);
});