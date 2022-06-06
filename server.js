const Hapi = require('@hapi/hapi');
const fetch = require("node-fetch");

const github_base_url = 'https://api.github.com/search/code?';
const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({
        method: ['POST'],
        path: '/',
        handler: function (request, h) {
        let payload =  request.payload;
        const results = [];
        const nodeValue = Object.values(payload).reduce((previousValue, currentValue) => {
            currentValue.forEach(val => {
                //insert the value by val id
                previousValue[val.id] = val;
                //add value if parent id is null
                if (val.parent_id === null) {
                    results.push(val);
                }
            });
        return previousValue;
        }, {});

        Object.values(payload).forEach(vals => {
        vals.forEach(val => {
            //check parent is not null
            if (val.parent_id !== null) {
                nodeValue[val.parent_id].children.push(val);
            }
        });
        });

    
        return results;
        }
    });

    server.route({
        method:['GET'],
        path:'/search',
        handler: function(request,h) {
            const {q, page, per_page} = request.query;
            console.log(request.query)
            if(!q) return { message : 'query is needed in params.'}
            const query = { 
                q : q, 
                page:  Number.parseInt(page) ?? 1, 
                per_page: Number.parseInt(per_page) ?? 30
            } 
            const url =  github_base_url + new URLSearchParams(query);   
            return fetch(url,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token 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',
                }
            })
            .then(response => response.json())
            .then(data => {
                return data
            })
            .catch(err => { 
                return err;
            });
        }
    })
    await server.start();
    console.log('Server running on port 3000');
};

init();