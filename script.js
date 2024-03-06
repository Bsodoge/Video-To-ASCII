import getVideoFrames from "https://deno.land/x/get_video_frames@v0.0.9/mod.js";

const inputElement = document.getElementById("file_input");
const asciiContainer = document.getElementById("ascii_container");
const loading = document.getElementById("loading");
const replayButton = document.getElementById("replay");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const playingVideo = [];
const { createWorker } = FFmpeg;

const toggleLoading = state => {
    if (state) {
        loading.classList.remove("hide");
        inputElement.classList.add("hide");
        return;
    }
    loading.classList.add("hide");
    inputElement.classList.remove("hide")
}

const toggleReplayButton = state => {
    state ? replayButton.classList.remove("hide") : replayButton.classList.add("hide");
}

const getFrames = async videoUrl => {
    let frames = [];
    await getVideoFrames({
        videoUrl,
        onFrame(frame) {
            frames.push(frame);
        },
        onConfig(config) {
            canvas.width = 100;
            canvas.height = 100;
        },
        onFinish() {
            console.log("finished!");
        }
    });
    console.log(frames);
    return frames;
}


const convertFrameToAscii = (arr, height, width) => {
    return new Promise((resolve, reject) => {
        try {
            let frameData = "";
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < (width * 4); j += 4) {
                    if (arr[j + 3] === 0) { frameData += "░"; continue; };
                    const total = arr[j] + arr[j + 1] + arr[j + 2];
                    const greyscale = parseInt(total / 3);
                    arr[j] = greyscale;
                    arr[j + 1] = greyscale;
                    arr[j + 2] = greyscale;
                    frameData += greyscale > 100 ? "▒" : greyscale > 75 ? "▓" : "█";
                }
                frameData += "\n";
                arr = arr.slice((width * 4));
            }
            resolve(frameData);
        } catch (error) {
            reject(error);
        }
    })
}

const handleFrame = async frame => {
    const width = 128;
    const height = 128;
    canvas.width = width;
    canvas.height = height;
    asciiContainer.innerText = "";
    ctx.drawImage(frame, 0, 0, width, height);
    frame.close();
    const imgData = ctx.getImageData(0, 0, width, height);
    let arr = imgData.data;
    canvas.style.border = "1px solid black";
    const asciiFrame = await convertFrameToAscii(arr, height, width);
    return asciiFrame;
}

const loadVideo = videoUrl => new Promise((resolve, reject) => {
    try {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
            resolve(video);
        }

        video.onerror = () => {
            reject("Invalid video. Please select a video file.")
        }
        video.src = videoUrl;
    } catch (error) {
        reject(error);
    }
})


const playVideo = (duration, asciiFrames, frames) => {
    if (playingVideo.length) {
        clearInterval(playingVideo[0]);
        playingVideo.pop();
    }
    let frameCount = 0;
    const fps = frames.length / duration;
    const playVideo = setInterval(() => {
        asciiContainer.innerText = asciiFrames[frameCount];
        frameCount++;
        if (frameCount === frames.length) {
            clearInterval(playVideo);
        }
    }, 1000 / fps);
    playingVideo.push(playVideo);
}

const getVideoDetails = async e => {
    toggleLoading(true);
    toggleReplayButton(false);
    await worker.load();
    await worker.write(e.target.files[0].name, e.target.files[0]);
    await worker.run(`-i /data/${e.target.files[0].name} output.mp4`);
    const { data } = await worker.read('output.mp4');
    const videoUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    const { duration } = await loadVideo(videoUrl);
    const frames = await getFrames(videoUrl);
    let asciiFrames = [];
    frames.forEach(async (frame, i) => {
        asciiFrames[i] = await handleFrame(frame);
    })
    toggleLoading(false);
    toggleReplayButton(true);
    playVideo(duration, asciiFrames, frames);
    replayButton.addEventListener("click", () => playVideo(duration, asciiFrames, frames));
}



inputElement.addEventListener("input", getVideoDetails);
