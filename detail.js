const needle = require('needle');
const cheerio = require('cheerio');
const tress = require('tress');
const resolve = require('url').resolve;


needle.defaults({
    open_timeout: 60000,
    user_agent: 'APIs-Google',
    parse_response: false 
});

const url = 'https://classinform.ru/profstandarty/07.005-spetcialist-administrativno-hoziaistvennoi-deiatelnosti.html';

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
                if($(this).children().length == 2) {
                    const name = '';
                    const code = $(this).children('td:nth-child(1)').text().trim();
                    const info = $(this).children('td:nth-child(3)').text().trim();
                } else {
                    const name = $(this).children('td:first-child').text().trim();
                    const code = $(this).children('td:nth-child(2)').text().trim();
                    const info = $(this).children('td:nth-child(3)').text().trim();
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
    console.log(table);
    // console.log($(':contains(Обобщенная трудовая функция)'));




    // if($('td:first-child:not(:last-child) > *:contains(Возможные)')) {
    //     $('td:first-child:not(:last-child) > *:contains(Возможные)').each(function() {
    //         const a = $(this).closest('tr').next().text().trim(); // Возможные 
    //         const i = {
    //             name:a,
    //         }
    //         table.push($(this).parent().next().text().trim());
            
    //     });
    // }
    // if($('td:first-child:not(:last-child):contains(Возможные)')) {
    //     $('td:first-child:not(:last-child):contains(Возможные)').each(function() {
    //         const a = $(this).closest('tr').next().text().trim(); // Возможные
    //         const i = {
    //             name:a,
    //         }
    //         table.push(i);
    //     });
    // }

    // console.log('Таблица',table);

});