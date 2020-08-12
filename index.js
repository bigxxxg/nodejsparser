const needle = require('needle');
const cheerio = require('cheerio');
const tress = require('tress');
const resolve = require('url').resolve;
var fs = require('fs');


needle.defaults({
    open_timeout: 60000,
    user_agent: 'APIs-Google',
    parse_response: false 
});

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
        $('#cont_txt').find(':contains(Обобщенная трудовая функция)').each(function(index,value) {
            if($(this).text().length < 50) {
                const wrap = $('<div>');
                // console.log($(el).text().indexOf('Трудовая функция'));
                $(this).next().nextUntil(':contains(Трудовая функция)').each(function() {
                    $(wrap).append($(this));
                });
                let name,eks,etks;
                eks = $(wrap).find(':contains(ЕКС)').closest('td').next().next().text().trim() ? $(wrap).find(':contains(ЕКС)').closest('td').next().text().trim() + ';' + $(wrap).find(':contains(ЕКС)').closest('td').next().next().text().trim() : '';
                etks = $(wrap).find(':contains(ЕТКС)').closest('td').next().next().text().trim() ? $(wrap).find(':contains(ЕТКС)').closest('td').next().text().trim() + ';' + $(wrap).find(':contains(ЕТКС)').closest('td').next().next().text().trim() : '';
    
    
                if($(wrap).find(':contains(Возможные)').closest('td').next().children().length > 1) {
                    name = $(wrap).find(':contains(Возможные)').closest('td').next().contents().map(function() {
                        return  $(this).text().length > 1 ? $(this).text() + "; " : "";
                    }).get().join('');
                } else if($(wrap).find(':contains(Возможные)').closest('td').next().children().length == 1) {
                    name = $(wrap).find(':contains(Возможные)').closest('td').next().children().contents().map(function() {
                        return  $(this).text().length > 1 ? $(this).text() + "; " : "";
                    }).get().join('');
                } else {
                    name = $(wrap).find(':contains(Возможные)').closest('td').next().text().trim();
                }
                
                const a = name;
                const dop = [];
                $(wrap).find(':contains(Наименование документа)').closest('tr').nextAll().each(function() {
                        let name, code, info;
                        
                    if($(this).children().length == 2) {
                        name = '';
                        code = $(this).children('td:nth-child(1)').text().trim();
                        info = $(this).children('td:nth-child(3)').text().trim();
                    } else {
                        name = $(this).children('td:first-child').text().trim();
                        code = $(this).children('td:nth-child(2)').text().trim();
                        info = $(this).children('td:nth-child(3)').text().trim();
                    }
                    
                    
                    if(name.trim()) {
                        dop.push({
                            name: name,
                            info: [code + ';' +info]
                        });
                    } else {
                        if(dop.length)  {
                            dop[dop.length - 1].info.push(code + ';' +info)
                        }
                    }
                    
                });
                const e = $(wrap).find(':contains(образованию и)').closest('td').next().text().trim();
                const f = $(wrap).find(':contains(Требования к опыту)').closest('td').next().text().trim();
                const g = $(wrap).find(':contains(допуска к работе)').closest('td').next().text().trim();
    
                const el = {
                    name: a,
                    dop: dop,
                    trebov: {
                        obr: e,
                        opit: f,
                        osob: g
                    }
                }
                if(el.name.trim()) {
                    table.push(el)
                }
            }
            
        });

        const i = {
            parentName: $('#cont_txt >.full_width:nth-child(5) > .path > .four_fifth > a').text().trim(),
            parentCode: $('#cont_txt >.full_width:nth-child(5) > .path > .one_fifth > a').text().trim(),
            name: $('.full_width > .four_fifth > h3').text().trim(),
            code: $('.full_width > .one_fifth > h3').text().trim(),
            subEl: table


        }
        console.log(i);
        results.push(i);
        cb();
    });
  
    

};


function done(){
    // console.log(results);
    fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
}
