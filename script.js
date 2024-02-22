const inputElement = document.getElementById("file_input");
const asciiContainer = document.getElementById("ascii_container");
const body = document.getElementsByTagName("body")[0];
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const convertFrameToAscii = (arr, height, width) => {
    return new Promise(resolve => {
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
    })
}

const handeLoadImage = async (e) => {
    const width = 128;
    const height = 128;
    canvas.width = width;
    canvas.height = height;

    asciiContainer.innerText = "";
    ctx.drawImage(e.target, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    let arr = imgData.data;
    canvas.style.border = "1px solid black";
    body.append(canvas);
    await convertFrameToAscii(arr, height, width);
}

const getImageDetails = async (e) => {
    const image = new Image();
    image.src = URL.createObjectURL(e.target.files[0]);
    image.addEventListener("load", handeLoadImage);
}



inputElement.addEventListener("input", getImageDetails);