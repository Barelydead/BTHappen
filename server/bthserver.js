/**
 * Front for BTH Room app
 */
"use strict";

//import Router from "./router";
import Router from "./router";
var router = new Router();


// module imports
var http = require("http");
var url = require("url");
var fs = require("fs");


let fullList,
jsonList,
salar,
args;

args = process.argv.slice(2);


fs.readFile('../salar.json', "utf8", (err, data) => {
    if (err) {
        throw err;
    }

    fullList = data;
    jsonList = JSON.parse(fullList);
    salar = jsonList.salar;
});



/**
 * Wrapper function for sending a JSON response
 *
 * @param  Object        res     The response
 * @param  Object/String content What should be written to the response
 * @param  Integer       code    HTTP status code
 */
function sendJSONResponse(res, content, code = 200) {
    res.writeHead(code, {'Content-Type': 'application/json; charset=utf8'});
    res.write(JSON.stringify(content, null, "    "));
    res.end();
}

function queryMax(req, list) {
    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;
    if (query.max) {
        return list.slice(0, Number.parseInt(query.max));
    }
    return list;
}

function checkCliOptions(respons) {
    if (args.indexOf("--develop") !== -1) {
        console.log(respons);
    }
}



/**
 * Display a helptext about the API.
 *
 * @param Object req The request
 * @param Object res The response
 */
router.get("/", (req, res) => {

    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf8'});
    res.write("Välkommen till BTH room app\n\n" +
        " /  Visa en lista av de routes som stöds.\n" +
        " /room/list 	Visa samtliga salar.\n" +
        " /room/view/id/:number 	Visa detaljer om salen med valt salsnummer.\n" +
        " /room/view/house/:house 	Visa samtliga salar som finns i ett visst hus.\n" +
        " /room/view/search/:search 	Visa de salar som matchar söksträngen.\n" +
        " /room/view/searchp/:search 	Visa de salar som matchar söksträngen. Sorterar svar efter bästa träff.\n"
    );
    res.end();
});

router.get("/room/list", (req, res) => {

    let jsonRespons = queryMax(req, salar);
    checkCliOptions(jsonRespons);
    sendJSONResponse(res, jsonRespons);

});


router.get("/room/view/id/:number", (req, res) => {
    let number = decodeURI(req.params.number.toLowerCase());

    let filtered = salar.filter((value) => {
        return String(value.Salsnr).toLowerCase() === number;
    });
    checkCliOptions(filtered);
    sendJSONResponse(res, filtered);
});


router.get("/room/view/house/:house", (req, res) => {
    let house = decodeURI(req.params.house.toLowerCase());

    let filtered = salar.filter((value) => {
        return String(value.Hus).toLowerCase() === house;
    });

    let jsonRespons = queryMax(req, filtered);
    checkCliOptions(filtered);
    sendJSONResponse(res, jsonRespons);
});


router.get("/room/view/search/:search", (req, res) => {
    let search = decodeURI(req.params.search.toLowerCase());

    // Check if search is substring of value
    function filterBySearchValue(value) {
        let bol = false;

        Object.keys(value).forEach(function (key) {
            if (String(value[key]).toLowerCase().includes(search) === true) {
                bol = true;
            }
        });

        return bol;
    }

    var filtered = salar.filter(filterBySearchValue);
    let jsonRespons = queryMax(req, filtered);

    checkCliOptions(filtered);
    sendJSONResponse(res, jsonRespons);
});

router.get("/room/view/searchp/:search", (req, res) => {
    let search = decodeURI(req.params.search.toLowerCase());

    // Check if search is substring of value
    function filterBySearchValue(value) {
        let bol = false;

        Object.keys(value).forEach(function (key) {
            if (String(value[key]).toLowerCase().includes(search)) {
                bol = true;
            }
        });

        return bol;
    }

    let filtered = salar.filter(filterBySearchValue);

    for (let i = 0; i < filtered.length; i++) {
        let room = filtered[i];
        room.searchScore = 0;

        Object.keys(room).forEach(function (key) {
            if (String(room[key]).toLowerCase().startsWith(search)) {
                filtered[i].searchScore += 0.2;
            }
        });

        Object.keys(room).forEach(function (key) {
            if (String(room[key]).toLowerCase() === search) {
                filtered[i].searchScore += 0.5;
            }
        });

        if (String(room.Salsnr).toLowerCase().includes(search) ||
            String(room.Salsnamn).toLowerCase().includes(search) ||
            String(room.Typ).toLowerCase().includes(search)) {
            filtered[i].searchScore += 0.2;
        }
    }

    function compareSearchScore(a, b) {
        if (a.searchScore > b.searchScore) {
            return -1;
        }
        if (a.searchScore < b.searchScore) {
            return 1;
        }
        return 0;
    }

    filtered.sort(compareSearchScore);

    let jsonRespons = queryMax(req, filtered);
    checkCliOptions(filtered);
    sendJSONResponse(res, jsonRespons);
});


/**
 * Create and export the server
 */
var server = http.createServer((req, res) => {
    var ipAddress;

    // Log incoming requests
    ipAddress = req.connection.remoteAddress;


    var route = url.parse(req.url).pathname;

    // Check what route is requested
    console.log("Incoming route " + route + " from ip " + ipAddress);

    // Let the router take care of all requests
    router.route(req, res);
});

export default server;
