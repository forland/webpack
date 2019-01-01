   'use strict';

    const addProduct = require('./handlers/create');
    const viewProduct = require('./handlers/view');
    const listProducts = require('./handlers/list');
    const removeProduct = require('./handlers/remove');
    
    const request = require('axios');
    const { extractGamesFromHTML } = require('./handlers/games');
    const { extractStatsFromHTML } = require('./handlers/stats');
    const { extractGameInfoFromHTML } = require('./handlers/gameinfo');


    const create = (event, context, callback) => {
        const data = JSON.parse(event.body);
        addProduct(data)
            .then(result => {
                const response = { body: JSON.stringify(result) };
                callback(null, response);
            })
            .catch(callback);
    };

    const list = (event, context, callback) => {
        listProducts()
            .then(result => {
                const response = { body: JSON.stringify(result) };
                callback(null, response);
            })
            .catch(callback);
    };


    const view = (event, context, callback) => {
        viewProduct(event.pathParameters.id)
            .then(result => {
                const response = { body: JSON.stringify(result) };
                callback(null, response);
            })
            .catch(callback);
    };


    const remove = (event, context, callback) => {
        removeProduct(event.pathParameters.id)
            .then(result => {
                const response = { body: JSON.stringify({message: 'Product removed.'}) };
                callback(null, response);
            })
            .catch(callback);
    };

    const getgameinfo = (event, context, callback) => {
        let idx = '/turnering/32794/raekke/90464/pulje/33636/kamp/671010'
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
            
                idx = event.pathParameters.id
        }
        idx = idx.replace(/-/g,'/');
        
        const url = 'https://minidraet.dgi.dk' + idx
        
        request(url)
            .then(({data}) => {
                const response = {
                                    statusCode: 200,
                                    headers: {
                                                'Access-Control-Allow-Origin': '*',
                                                'Access-Control-Allow-Credentials': true,
                                    },
                                    body: JSON.stringify(extractGameInfoFromHTML(data))
                                 };
                
                callback(null, response);
            })
            .catch(callback);
    };
    
    const getstats = (event, context, callback) => {
        let idx = '-turnering-32794-Raekke-90473-Pulje-33647'
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
            
                idx = event.pathParameters.id
        }
        
        idx = idx.replace(/-/g,'/');
        
        const url = 'https://minidraet.dgi.dk' + idx
        
        request(url)
            .then(({data}) => {
                const response = {
                                    statusCode: 200,
                                    headers: {
                                                'Access-Control-Allow-Origin': '*',
                                                'Access-Control-Allow-Credentials': true,
                                    },
                                    body: JSON.stringify(extractStatsFromHTML(data))
                                 };
                
                callback(null, response);
            })
            .catch(callback);
    };
    
    const getgames = (event, context, callback) => {
        let idx = '-forening-2148000-hold-152407'
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
            
                idx = event.pathParameters.id
        }
        
        idx = idx.replace(/-/g,'/');
        
        const url = 'https://minidraet.dgi.dk' + idx
        
        request(url)
            .then(({data}) => {
                const response = {
                                    statusCode: 200,
                                    headers: {
                                                'Access-Control-Allow-Origin': '*',
                                                'Access-Control-Allow-Credentials': true,
                                    },
                                    body: JSON.stringify(extractGamesFromHTML(data))
                                 };
                
                callback(null, response);
            })
            .catch(callback);
    };


    module.exports = {
        create,
        view,
        remove,
        list,
        getgames,
        getstats,
        getgameinfo
    };