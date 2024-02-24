import getVideoFrames from "https://deno.land/x/get_video_frames@v0.0.9/mod.js";

const inputElement = document.getElementById("file_input");
const asciiContainer = document.getElementById("ascii_container");
const body = document.getElementsByTagName("body")[0];
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");


const getFrames = async (videoUrl) => {
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
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < (width * 4); j += 4) {
                    console.log(arr[j + 3]);
                    if (arr[j + 3] === 0) { asciiContainer.innerText += "░"; continue; };
                    const total = arr[j] + arr[j + 1] + arr[j + 2];
                    const greyscale = parseInt(total / 3);
                    arr[j] = greyscale;
                    arr[j + 1] = greyscale;
                    arr[j + 2] = greyscale;
                    asciiContainer.innerText += greyscale > 100 ? "█" : greyscale > 75 ? "▓" : "▒";
                }
                asciiContainer.innerText += "\n";
                arr = arr.slice((width * 4));
            }
            resolve(arr);
        } catch (error) {
            reject(error);
        }
    })
}

const handleLoadImage = async (frame) => {
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
    body.append(canvas);
    await convertFrameToAscii(arr, height, width);
}

const getImageDetails = async (e) => {
    const videoUrl = URL.createObjectURL(e.target.files[0]);
    console.log(videoUrl);
    const frames = await getFrames(videoUrl);
    setTimeout(frames.forEach(async (frame) => {
        await handleLoadImage(frame);
    }), 1000);

}



inputElement.addEventListener("input", getImageDetails);