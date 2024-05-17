import "./style.css";

let currentCamera = "environment";
let camera;
let lastFrameTime = 0;
let fps = 0;

// Setup MediaPipe Hands
const hands = new Hands({
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});

hands.onResults(onResults);

// Setup video and canvas elements
const videoElement = document.getElementById("input_video");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

function onResults(results) {
    const now = performance.now();
    if (lastFrameTime) {
        fps = Math.round(1000 / (now - lastFrameTime));
    }
    lastFrameTime = now;

    // Clear the canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Flip the image horizontally
    canvasCtx.scale(-1, 1);
    canvasCtx.translate(-canvasElement.width, 0);

    // Draw video frame
    canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    // Draw hand landmarks
    // Draw hand landmarks
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 5,
            });
            drawLandmarks(canvasCtx, landmarks, {
                color: "#FF0000",
                lineWidth: 2,
            });
        }
    }

    // Display FPS
    canvasCtx.restore();
    document.getElementById("fps").textContent = `FPS: ${fps}`;
}

// Setup Camera
function startCamera() {
    if (camera) {
        camera.stop();
    }
    camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480,
        facingMode: currentCamera,
    });
    camera.start();
}

document.getElementById("switch-camera").addEventListener("click", () => {
    currentCamera = currentCamera === "user" ? "environment" : "user";
    startCamera();
});

startCamera();
