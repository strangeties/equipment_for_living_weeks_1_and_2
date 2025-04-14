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
// Update alpha.
function UpdateAlphaMouse(x, y) {
    if (Math.random() > 0.33) {
        return;
    }
    
    var dsquare_thresh = Math.random() * 2500;

    for (var ai = 0; ai < 600; ai++) {
        for (var aj = 0; aj < 600; aj++) {
            alpha_i = aj * 600 + ai;

            var dx = ai - x;
            var dy = aj - y;
            var dsquare = dx * dx + dy * dy;
            if (dsquare < dsquare_thresh) {
                da = Math.max((0.4 - dsquare * 0.4 / 2500) * Math.random(), 0.0)
                alpha[alpha_i] = Math.max(alpha[alpha_i] - da, 0.0);
            }
        }
    }
}
function UpdateAlpha() {
    for (var ai = 0; ai < 600; ai++) {
        for (var aj = 0; aj < 600; aj++) {
            alpha_i = aj * 600 + ai;
            alpha[alpha_i] = alpha[alpha_i] +
                             (1.0 - alpha[alpha_i]) * Math.random() * 0.03;
        }
    }
}

function Draw(ctx) {
    var imageData = ctx.createImageData(600, 600);
    for (var i = 0; i < 600; i++) {
        for (var j = 0; j < 600; j++) {
            ind = (i * 600 + j) * 4
            var a = alpha[i * 600 + j];
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
    UpdateAlpha();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Draw(ctx)
}

Start();

canvas.addEventListener('mousemove',
                        (e) => { UpdateAlphaMouse(e.offsetX, e.offsetY); });
