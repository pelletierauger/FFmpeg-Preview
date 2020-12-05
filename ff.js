var execFile = require('child_process').execFile;
const fs = require('fs');
const path = "./video-renders/purple-smear.png";

if (fs.existsSync(path)) {
    fs.unlinkSync(path, (err) => {
        if (err) throw err;
        console.log(path + " was successfully deleted");
    });
}

var args = [
    // "-f", "image2", "-framerate", "24",
    "-i", "./video-renders/alligator-foggy-00001.png",
    "-filter_complex"
    // "[0:0] gblur=sigma=10:steps=1, colorlevels=rimax=0.4:gimax=0.4:bimax=0.4 [a]; [0:0] gblur=sigma=20:steps=1, colorlevels=rimax=0.4:gimax=0.4:bimax=0.4 [b]; [0:0][a] blend=all_mode='hardlight':all_opacity=0.45 [c]; [c][b] blend=all_mode='softlight':all_opacity=0.45",
    // "./video-renders/purple-smear.png"
];

var filterGraph = `
[0:0] gblur=sigma=10:steps=1, colorlevels=rimax=0.4:gimax=0.4:bimax=0.4 [a]; 
[0:0] gblur=sigma=40:steps=1, colorlevels=rimax=0.4:gimax=0.4:bimax=0.4 [b]; 
[0:0][a] blend=all_mode='hardlight':all_opacity=0.75 [c]; 
[c][b] blend=all_mode='softlight':all_opacity=0.45`;

// console.log("" + test.split("\n"));
// args[7] = test;
args.push(filterGraph);
args.push("./video-renders/purple-smear.png");
// args = [
//     "-i", "./video-renders/purple-pulsar-00001.png",
//     "-s", "640x480",
//     "./video-renders/purple-smear.png"
// ];

// args = args.split(" ");
// args.push(filter);
// args.push(args2);
console.log(args);
var proc = execFile("ffmpeg", args);

proc.stdout.on('data', function(data) {
    console.log(data);
});

proc.stderr.on('data', function(data) {
    console.log(data);
});

proc.on('close', function() {
    console.log('finished');
});