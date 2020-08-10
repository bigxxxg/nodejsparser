const needle = require('needle');
const cheerio = require('cheerio');
const tress = require('tress');
const resolve = require('url').resolve;
var fs = require('fs');


const URL = 'https://classinform.ru/profstandarty.html';
const results = [];
const q = tress(work);
q.drain = done;
start();


function start() {
    needle.get(URL, function(err, res) {
        if (err) throw err;
        const $ = cheerio.load(res.body);
        $('.full_width .four_fifth > a').each(function() {
            q.push(resolve(URL, $(this).attr('href')))
        });
    });
}
function work(url, cb) {
    needle.get(url, function(err, res){
        if (err) throw err;

        const $ = cheerio.load(res.body);
        const subEl = [];
        $('.full_width > .one_fifth > a').each(function() {
            const table = [];
                const subUrl = resolve(URL, $(this).attr('href'));
                needle.get(subUrl, function(err, res) {
                    const $ = cheerio.load(res.body);
                    
                    $('td:first-child > *:contains(Возможные)').each(function() {
                        table.push($(this).parent().next().children().text().trim());
                    });
                    console.log(subUrl);
                    console.log('Таблица',table);
                });

        
            const el = {
                code: $(this).text().trim(),
                name: $(this).parent().next().children().text().trim(),
                url: resolve(URL, $(this).attr('href')),
                table: table
            }
            subEl.push(el);
        });
        const i = {
            name: $('.full_width > .four_fifth > h3').text().trim(),
            code: $('.full_width > .one_fifth > h3').text().trim(),
            subEl: subEl
        }
        results.push(i);
        cb();
    });
};


function done(){
    console.log(results);
}

fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));

