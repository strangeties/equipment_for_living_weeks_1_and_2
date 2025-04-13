var canvas = document.getElementById("memory");
var ctx = canvas.getContext("2d");


// Images
var lakeImageData = ctx.createImageData(600, 600);
const lakeImage = new Image();
lakeImage.src = "lake.jpg"
lakeImage.addEventListener("load", () => {
    ctx.drawImage(lakeImage, 0, 0);
    lakeImageData = ctx.getImageData(0, 0, 600, 600);
});

var closetImageData = ctx.createImageData(600, 600);
const closetImage = new Image();
closetImage.src = "closet.jpg"
closetImage.addEventListener("load", () => {
    ctx.drawImage(closetImage, 0, 0);
    closetImageData = ctx.getImageData(0, 0, 600, 600);
});

// Alpha
var alpha = new Float32Array(600 * 600).fill(1.0);
// Image data
var imageData = ctx.createImageData(600, 600);

function Draw(ctx) {
    for (var i = 0; i < 600; i++) {
        for (var j = 0; j < 600; j++) {
            ind = (i * 600 + j) * 4
            var a = alpha[i * 600 + j]
            for (var k = 0; k < 3; k++) {
                imageData.data[ind + k] =
                    (a * closetImageData.data[ind + k] +
                     (1.0 - a) * lakeImageData.data[ind + k]);
            }
            imageData.data[ind + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function Start() {
    Draw(ctx)
    setInterval(Update, 30);
}

function Update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Draw(ctx)
}

Start();

canvas.addEventListener('mousemove', (e) => {
    x = e.offsetX;
    y = e.offsetY;
    for (var ai = 0; ai < 600; ai++) {
        for (var aj = 0; aj < 600; aj++) {
            if ((Math.abs(ai - e.offsetX) < 10) &&
                (Math.abs(aj - e.offsetY) < 10)) {
                alpha[aj * 600 + ai] = 0.0;
            } else {
                alpha[aj * 600 + ai] = 1.0;
            }
        }
    }
});
