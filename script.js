const inputElement = document.getElementById("file_input");
const asciiContainer = document.getElementById("ascii_container");
const body = document.getElementsByTagName("body")[0];
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const converToASCII = (e) => {
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
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < (width * 4); j += 4) {
            const total = arr[j] + arr[j + 1] + arr[j + 2];
            const greyscale = parseInt(total / 3);
            arr[j] = greyscale;
            arr[j + 1] = greyscale;
            arr[j + 2] = greyscale;
            //asciiContainer.innerText += greyscale > 130 ? "█" : "░";
            asciiContainer.innerText += greyscale > 100 ? "█" : greyscale > 75 ? "▓" : greyscale > 50 ? "▒" : "░";
        }
        asciiContainer.innerText += "\n";
        arr = arr.slice((width * 4));
        debugger;
    }
}

const getImageDetails = (e) => {
    const image = new Image();
    image.src = URL.createObjectURL(e.target.files[0]);
    image.onload = converToASCII;
}



inputElement.addEventListener("input", getImageDetails);