let looping = false;
let socket, cnvs, ctx, canvasDOM;
let fileName = "./frames/sketch";
let maxFrames = 20;
let editor;

function setup() {
    socket = io.connect('http://localhost:8080');
    cnvs = createCanvas(windowWidth, windowWidth / 16 * 9);
    // cnvs = createCanvas(windowWidth, windowHeight);
    canvasDOM = document.getElementById('defaultCanvas0');
    ctx = canvasDOM.getContext("2d");
    frameRate(30);
    background(0);
    fill(255, 50);
    noStroke();
    if (!looping) {
        noLoop();
    }
    ellipse(width / 2, height / 2, 50);
    socket.on("pushImage", function(info) {
        if (info.image) {
            console.log(info);
            var img = new Image();
            img.src = 'data:image/png;base64,' + info.buffer;
            ctx.drawImage(img, 0, 0);
            console.log("Beauty is on its way.");
            ellipse(width / 3, height / 3, 50);
        }
    });
    socket.on("updateImage", function(info) {
        loadImage('output.png', img => {
            image(img, 0, 0, width, height);
        });
    });
    // loadImage('torn-smear.png', img => {
    //     image(img, 0, 0, width, height);
    // });
    editor = document.getElementById("editor");
    editor.addEventListener('keydown', function(e) {
        // let text = editor.innerText.replace(/\n/g, ``);
        let text = editor.innerText.replace(/(\r\n|\n|\r)/gm, "");
        text = text.replace(/\s+/g, " ");
        text = text.replace(/\\/g, "");
        if (e.keyCode == 13 && e.metaKey) {
            console.log(text);
            socket.emit("exec", text);
        }
    });
}

function draw() {
    // for (let i = 0; i < 500; i++) {
    //     let x = random(width);
    //     let y = random(height);
    //     ellipse(x, y, 5);
    // }
    // if (exporting && frameCount < maxFrames) {
    //     frameExport();
    // }
}

function keyPressed() {
    // if (keyCode === 32) {
    //     if (looping) {
    //         noLoop();
    //         looping = false;
    //     } else {
    //         loop();
    //         looping = true;
    //     }
    // }
    // if (key == 'p' || key == 'P') {
    //     frameExport();
    // }
    // if (key == 'r' || key == 'R') {
    //     window.location.reload();
    // }
    // if (key == 'm' || key == 'M') {
    //     redraw();
    // }
}