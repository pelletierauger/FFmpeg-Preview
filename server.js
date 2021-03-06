var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');
var execFile = require('child_process').execFile;

function handleRequest(req, res) {
    // What did we request?
    var pathname = req.url;
    var pathnametest = pathname;
    // console.log(pathname);
    var query = url.parse(req.url, true).query;

    var r = /\?/g;
    if (pathname.match(r)) {
        var re = /\?(.*)/gi;
        pathnametest = pathnametest.replace(re, ``);
        // console.log(pathnametest);
    }
    pathname = pathnametest;

    // console.log(query);
    // If blank let's ask for index.html
    if (pathname == '/') {
        pathname = '/index.html';
    }
    // Ok what's our file extension
    var ext = path.extname(pathname);
    // Map extension to file type
    var typeExt = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    };

    //What is it?  Default to plain text
    var contentType = typeExt[ext] || 'text/plain';
    // Now read and write back the file with the appropriate content type
    fs.readFile(__dirname + pathname, function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + pathname);
        }
        // Dynamically setting content type
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
    // res.end(JSON.stringify(query));
}

let imageInputs = [];
if (!process.argv[2]) {
    console.log("The path of an image input must be provided.");
    return;
} else {
    for (let i = 2; i < process.argv.length; i++) {
        imageInputs.push(process.argv[i]);
    }
    console.log(imageInputs);
    let verb = (imageInputs.length === 1) ? " input was detected and is" : " inputs were detected and are";
    let amount = imageInputs.length;
    console.log(amount + verb + " now available in FFMPEG.");
}


// Create a server with the handleRequest callback
var server = http.createServer(handleRequest);
// Listen on port 8080
server.listen(8080);
console.log('Server started on port 8080');

var io = require('socket.io').listen(server);

var clients = {};

io.sockets.on('connection', function(socket) {
    console.log("Client " + socket.id + " is connected.");

    socket.on('pullJSONs', function() {
        io.sockets.emit('pushJSONs', JSONs);
    });

    socket.on('mouse', function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'mouse' " + data.x + " " + data.y);
        // Send it to all other clients
        socket.broadcast.emit('mouse', data);
    });

    socket.on('bounce', function(data) {
        console.log(data);
    });

    socket.on('image', function(data) {
        // console.log(dataUrl);

        // var imageBuffer = new Buffer(dataUrl, 'base64'); //console = <Buffer 75 ab 5a 8a ...
        // fs.writeFile("test.jpg", imageBuffer, function(err) { //... });

        var imageBuffer = decodeBase64Image(data.dataUrl);
        // console.log(imageBuffer);

        fs.writeFile(data.name + ".png", imageBuffer.data, function(err) {
            if (err) {
                return console.error(err);
            } else {
                console.log(data.name + ".png written successfully.");
            }
        });
    });
    socket.on('pullImage', function(socket) {
        fs.readFile("/Users/guillaumepelletier/Desktop/Torn/torn.png", function(err, buf) {
            // it's possible to embed binary data
            // within arbitrarily-complex objects
            io.sockets.emit('pushImage', { image: true, buffer: buf.toString('base64') });
            console.log('image file is initialized');
        });
    });

    // socket.on('savePoints', function(data) {
    //     console.log(data);
    //     data = JSON.stringify(data);
    //     var fileName = filenameFormatter(Date());
    //     fileName = fileName.slice(0, fileName.length - 13);
    //     fs.writeFile("./JSONs/" + fileName + '.json', data, function(err) {
    //         if (err) {
    //             return console.error(err);
    //         } else {
    //             console.log("./JSONs/" + fileName + '.json written successfully.');
    //         }
    //     });
    // });
    socket.on('exec', function(data) {

        let filePath = "output.png";
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath, (err) => {
                if (err) throw err;
                console.log(filePath + " was successfully deleted");
            });
        }
        let args = [];
        for (let i = 0; i < imageInputs.length; i++) {
            args.push("-i", imageInputs[i]);
        }
        args.push("-filter_complex");
        // var args = [
        //     "-i", imageInput,
        //     "-i", "/Users/guillaumepelletier/Desktop/Dropbox/Art/p5/Bellevue/border2.png",
        //     "-filter_complex"
        // ];
        args.push(data);
        args.push(filePath);
        console.log(args);
        let proc = execFile("ffmpeg", args);

        proc.stdout.on('data', function(data) {
            console.log(data);
        });

        proc.stderr.on('data', function(data) {
            console.log(data);
        });

        proc.on('close', function() {
            console.log('finished');
            io.sockets.emit('updateImage');
        });
    });
});

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}





// const path = "./video-renders/purple-smear.png";





var filterGraph = `
[0:0] gblur=sigma=10:steps=1, colorlevels=rimax=0.4:gimax=0.4:bimax=0.4 [a]; 
[0:0] gblur=sigma=40:steps=1, colorlevels=rimax=0.4:gimax=0.4:bimax=0.4 [b]; 
[0:0][a] blend=all_mode='hardlight':all_opacity=0.75 [c]; 
[c][b] blend=all_mode='softlight':all_opacity=0.45`;

// console.log("" + test.split("\n"));
// args[7] = test;
// args.push(filterGraph);
// args.push("./video-renders/purple-smear.png");
// let proc = execFile("ffmpeg", args);

// proc.stdout.on('data', function(data) {
//     console.log(data);
// });

// proc.stderr.on('data', function(data) {
//     console.log(data);
// });

// proc.on('close', function() {
//     console.log('finished');
// });