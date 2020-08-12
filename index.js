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
        $('.full_width > .four_fifth > a').each(function() {
            
            needle.get(resolve(URL, $(this).attr('href')), function(err, res) {
                if (err) throw err;
                const $ = cheerio.load(res.body);
                $('.full_width > .one_fifth > a').each(function() {
                    q.push(resolve(URL, $(this).attr('href')));
                });
                
            });
        });

    });
}
function work(url, cb) {
    needle('get', url).then(function(res){
        const $ = cheerio.load(res.body);
        const table = [];
        if($('td:first-child:not(:last-child) > *:contains(Возможные)')) {
            $('td:first-child:not(:last-child) > *:contains(Возможные)').each(function() {
                table.push($(this).parent().next().children().text().trim());
            });
        }
        if($('td:first-child:not(:last-child) :contains(Возможные)')) {
            $('td:first-child:not(:last-child) :contains(Возможные)').each(function() {
                
                const i = {
                    name:$(this).parent().next().children().text().trim(),
                }
                table.push(i);
            });
        }
        
        console.log(url);
        console.log('Таблица',table);

        const i = {
            parentName: $('#cont_txt >.full_width:nth-child(5) > .path > .four_fifth > a').text().trim(),
            parentCode: $('#cont_txt >.full_width:nth-child(5) > .path > .one_fifth > a').text().trim(),
            name: $('.full_width > .four_fifth > h3').text().trim(),
            code: $('.full_width > .one_fifth > h3').text().trim(),


        }
        results.push(i);
        cb();
    });
  
    

};


function done(){
    // console.log(results);
    fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
}
