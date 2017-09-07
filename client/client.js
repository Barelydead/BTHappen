#!/usr/bin/env babel-node

/**
 * Main program to run the BTH Room client
 *
 */
"use strict";

const VERSION = "1.0.0";

// For CLI usage
var path = require("path");
var http = require("http");
var scriptName = path.basename(process.argv[1]);
var args = process.argv.slice(2);
let server;
let arg;

let develop = false;
let port = "1337";
let url = "localhost";




// Make it using prompt
var readline = require("readline");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function httpGet(query) {
    return new Promise((resolve, reject) => {
        http.get(server + query, (res) => {
            var data = "";

            res.on('data', (chunk) => {
                data += chunk;
            }).on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(data);
                }
            }).on('error', (e) => {
                reject("Got error: " + e.message);
            });
        });
    });
}




/**
 * Display helptext about usage of this script.
 */
function usage() {
    console.log(`Usage: ${scriptName} [options]

Options:
 -h               Display help text.
 -v               Display the version.
 --server <url>   Set the server and start client.
 --port <number>  Set the port and start client.`);
}



/**
 * Display helptext about bad usage.
 *
 * @param String message to display.
 */
function badUsage(message) {
    console.log(`${message}
Use -h to get an overview of the command.`);
}



/**
 * Display version.
 */
function version() {
    console.log(VERSION);
}



// Check for CLI-flags
while ((arg = args.shift()) !== undefined) {
    switch (arg) {
        case "-h":
            usage();
            process.exit(0);
            break;

        case "-v":
            version();
            process.exit(0);
            break;

        case "--port":
            port = Number.parseInt(args.shift());
            if (Number.isNaN(port)) {
                console.log("port must be a number");
                process.exit(1);
            }
            break;

        case "--server":
            url = args.shift();
            break;

        case "--develop":
            develop = true;
            break;


        default:
            badUsage("Unknown argument.");
            process.exit(1);
            break;
    }
}



/**
 * Display a menu.
 */
function menu() {
    console.log(`Commands available:
 exit               Leave this program.
 menu               See this list of valid menu options.
 list               List all rooms.
 view <roomNr>      View one specific room.
 house <house>      Search for rooms in a specific house.
 search <search>    Search rooms with searchword.
 searchp <search>   Search Rooms with searchword and get
                    prioritised responses first
`);
}



/**
 * Callbacks for game asking question.
 */
rl.on("line", function(line) {
    // Split incoming line with arguments into an array
    var args = line.trim().split(" ");
    args = args.filter(value => {
        return value !== "";
    });

    switch (args[0]) {
        case "menu":
            menu();
            rl.prompt();
            break;

        case "url":
            console.log("The url for the requests is: ", server);
            rl.prompt();
            break;

        case "list":
            httpGet("/room/list").then(value => {
                    for (let i = 0; i < value.length; i++) {
                        console.log(value[i]);
                    }
                    if (develop === true) {
                        console.log("Request URL: " + server + "/room/list");
                    }
                    rl.prompt();
                })
                .catch(err => {
                    console.log("Something went wrong: " + err);
                    rl.prompt();
                });
            break;

        case "view":
            let id = args[1];
            httpGet("/room/view/id/" + id).then(value => {
                    console.log(value[0]);
                    if (develop === true) {
                        console.log("Request URL: " + server + "/room/view/id/" + id);
                    }
                    rl.prompt();
                })
                .catch(err => {
                    console.log("Something went wrong: " + err);
                    rl.prompt();
                });
            break;

        case "house":
            let house = args[1];
            httpGet("/room/view/house/" + house).then(value => {
                    let namedRooms = 0;

                    for (var i = 0; i < value.length; i++) {
                        console.log(value[i].Salsnr + ", " + value[i].Salsnamn + " - " + value[i].Typ);
                        namedRooms += 1;
                    }
                    if (develop === true) {
                        console.log("Request URL: " + server + "/room/view/house/" + house);
                    }
                    rl.prompt();
                })
                .catch(err => {
                    console.log("Something went wrong: " + err);
                    rl.prompt();
                });
            break;

        case "search":
            let search = args[1];
            httpGet("/room/view/search/" + search).then(value => {
                for (var i = 0; i < value.length; i++) {
                    console.log(value[i].Salsnr + ", " + value[i].Salsnamn + ", " + value[i].Hus + ", " + value[i].Typ);
                }
                if (develop === true) {
                    console.log("Request URL: " + server + "/room/view/search/" + search);
                }
                rl.prompt();
            })
            .catch(err => {
                console.log("Something went wrong: " + err);
                rl.prompt();
            });
            break;

        case "searchp":
            search = args[1];
            httpGet("/room/view/searchp/" + search).then(value => {
                for (var i = 0; i < value.length; i++) {
                    console.log(value[i].Salsnr + ", " + value[i].Salsnamn + ", " + value[i].Hus + ", " + value[i].Typ);
                }
                if (develop === true) {
                    console.log("Request URL: " + server + "/room/view/search/" + search);
                }
                rl.prompt();
            })
            .catch(err => {
                console.log("Something went wrong: " + err);
                rl.prompt();
            });
            break;

        case "exit":
            console.log("Thanks for using this client. C ya!");
            process.exit(0);
            break;

        default:
            console.log("Enter 'menu' to get an overview of what you can do here.");
            rl.prompt();
    }
});



rl.on("close", function() {
    console.log("Bye!");
    process.exit(0);
});



// Main
server = "http://" + url + ":" + port;
console.log("Use -h to get a list of options to start this program.");
console.log("Ready to talk to server url '" + server + "'.");
console.log("Use 'menu' to get a list of commands.");
rl.setPrompt("BTH-Room >> ");
rl.prompt();
