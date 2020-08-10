const needle = require('needle');

const URL = 'https://classinform.ru/profstandarty.html';

needle.get(URL, function(err, res) {
    if (err) throw err;
    console.log(res.body);
    console.log(res.statusCode);
});