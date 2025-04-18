const MAX_DSQUARE = 2500;
const MAX_DALPHA = 0.5;

const P_UPDATE_ALPHA_MOUSE_MOVE = 0.33;

var canvas = document.getElementById("memory");
var ctx = canvas.getContext("2d");

// Audio
var audio_ctx = new (window.AudioContext || window.webkitAudioContext)();
var is_loading = true;
var is_first_play = true;
var is_playing = false;
buffer_loader = new BufferLoader(audio_ctx, [ 'traffic.wav', 'birds.wav' ],
                                 InitializeBuffersHelper)
buffer_loader.load();
class SimpleAudioChain {
    constructor(b, gain, pan) {
        this.source = audio_ctx.createBufferSource();
        this.source.buffer = b;
        this.source.loop = true;

        this.gain = audio_ctx.createGain();
        this.gain.gain.value = gain;

        this.pan = audio_ctx.createStereoPanner();
        this.pan.value = pan;

        this.gain.connect(audio_ctx.destination);
        this.pan.connect(this.gain);
        this.source.connect(this.pan);
    }
}
var traffic_chain;
var birds_chain;
function InitializeBuffersHelper(buffer_list) {
    traffic_chain = new SimpleAudioChain(buffer_list[0], 0.0, -1);
    birds_chain = new SimpleAudioChain(buffer_list[1], 0.1, 0.2);
    is_loading = false;
}

// Images
function drawImageInContext(image) {
    var tmp_canvas = document.createElement("canvas");
    tmp_canvas.width = canvas.width;
    tmp_canvas.height = canvas.height;
    const tmp_ctx = tmp_canvas.getContext('2d');
    tmp_ctx.drawImage(image, 0, 0);
    return tmp_ctx;
}

var lakeImageData = ctx.createImageData(canvas.width, canvas.height);
const lakeImage = new Image();
lakeImage.src = "lake.jpg"
lakeImage.addEventListener("load", () => {
    var tmp_ctx = drawImageInContext(lakeImage);
    lakeImageData = tmp_ctx.getImageData(0, 0, canvas.width, canvas.height);
});

var closetImageData = ctx.createImageData(canvas.width, canvas.height);
const closetImage = new Image();
closetImage.src = "closet.jpg"
closetImage.addEventListener("load", () => {
    var tmp_ctx = drawImageInContext(closetImage);
    closetImageData = tmp_ctx.getImageData(0, 0, canvas.width, canvas.height);
});

// Alpha, aka opacity.
var alpha = new Float32Array(canvas.width * canvas.height).fill(1.0);
function UpdateAlphaMouse(x, y) {
    if (Math.random() > P_UPDATE_ALPHA_MOUSE_MOVE) {
        return;
    }

    var dsquare_thresh = Math.random() * MAX_DSQUARE;

    for (var ai = 0; ai < canvas.width; ai++) {
        for (var aj = 0; aj < canvas.height; aj++) {
            var alpha_i = aj * canvas.width + ai;

            var dx = ai - x;
            var dy = aj - y;
            var dsquare = dx * dx + dy * dy;
            if (dsquare < dsquare_thresh) {
                da =
                    Math.max((MAX_DALPHA - dsquare * MAX_DALPHA / MAX_DSQUARE) *
                                     Math.random() +
                                 0.05,
                             0.0)
                alpha[alpha_i] = Math.max(alpha[alpha_i] - da, 0.0);
            }
        }
    }
}
function UpdateAlpha() {
    for (var ai = 0; ai < canvas.width; ai++) {
        for (var aj = 0; aj < canvas.height; aj++) {
            alpha_i = aj * canvas.width + ai;
            alpha[alpha_i] =
                alpha[alpha_i] + (1.0 - alpha[alpha_i]) * Math.random() * 0.03;
        }
    }
}
function UpdateGain() {
    if (traffic_chain == null) {
        return;
    }
    sum = 0.0;
    count = 0;
    for (var ai = 0; ai < canvas.width; ai++) {
        for (var aj = 0; aj < canvas.height; aj++) {
            alpha_i = aj * canvas.width + ai;
            sum = sum + 1.0 - alpha[alpha_i]
            count = count + 1;
        }
    }
    traffic_chain.gain.gain.value = sum / count;
    traffic_chain.pan.value = -1.0 + sum / count;

    birds_chain.gain.gain.value = Math.exp(-100.0 * sum / count);
}

function Draw(ctx) {
    if (is_loading) {
        ctx.font = "20px serif";
        ctx.fillStyle = "#4D4847";
        ctx.fillText("Loading ...", 10, 20);
        return;
    }
    if (!is_playing) {
        ctx.font = "20px serif";
        ctx.fillStyle = "#4D4847";
        ctx.fillText("Click to start ...", 10, 20);
        return;
    }

    var imageData = ctx.createImageData(canvas.width, canvas.height);
    for (var i = 0; i < canvas.width; i++) {
        for (var j = 0; j < canvas.height; j++) {
            var ai = j * canvas.width + i;
            var ii = ai * 4;
            var a = alpha[ai];
            for (var k = 0; k < 3; k++) {
                imageData.data[ii + k] =
                    (a * closetImageData.data[ii + k] +
                     (1.0 - a) * lakeImageData.data[ii + k]);
            }
            imageData.data[ii + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.font = "20px serif";
    ctx.fillStyle = "#4D4847";
    ctx.fillText("Click to pause ...", 10, 20);
}

function Update() {
    if (is_loading) {
        return;
    }
    UpdateAlpha();
    UpdateGain();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Draw(ctx)
}

function Start() {
    Draw(ctx)
    setInterval(Update, 30);
}

Start();

canvas.addEventListener('mousemove',
                        (e) => { UpdateAlphaMouse(e.offsetX, e.offsetY); });

canvas.addEventListener('click', (e) => {
    if (is_loading) {
        return;
    }
    if (is_playing) {
        audio_ctx.suspend();
        is_playing = false;
    } else {
        audio_ctx.resume();
        if (is_first_play) {
            traffic_chain.source.start();
            birds_chain.source.start();
            is_first_play = false;
        }
        is_playing = true;
    }
});
