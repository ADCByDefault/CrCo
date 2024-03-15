const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const origin = { x: 0, y: 0 };
const size = { x: 0, y: 0 };
let win = -1;
let centers = [];
let localData = null;
/**
 * @type {CanvasRenderingContext2D}
 */
const ctx = canvas.getContext("2d");

window.addEventListener("load", (e) => {
    windowResized();
    setLocalData();
});

let b = new BroadcastChannel("blob");
b.addEventListener("message", (e) => {
    console.log(e.data);
    if (e.data.startsWith("unloaded")) {
        if (parseInt(e.data.split(",")[1]) < win) {
            win = win - 1;
        }
    }
    if (e.data == "reloadAll") {
        window.location.reload();
    }
});

window.addEventListener("resize", (e) => {
    windowResized();
    setLocalData();
});

function windowResized() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    origin.x = window.screenX;
    origin.y = window.screenY;
    size.x = window.innerWidth;
    size.y = window.innerHeight;
}

function setLocalData() {
    fetchLocalData();
    let tarr = localData ? localData : [];
    win = win == -1 ? tarr.length : win;
    tarr[win] = {
        x: window.screenX + window.innerWidth / 2,
        y: window.screenY + window.innerHeight / 2,
    };
    localStorage.setItem("centers", JSON.stringify(tarr));
}

function fetchLocalData() {
    localData = JSON.parse(localStorage.getItem("centers"));
}

function windowMoved() {
    if (origin.x == window.screenX && origin.y == window.screenY) {
        return;
    }
    origin.x = window.screenX;
    origin.y = window.screenY;
    setLocalData();
}

function aniamte() {
    window.requestAnimationFrame(aniamte);
    windowMoved();
    fetchLocalData();
    ctx.clearRect(0, 0, size.x, size.y);
    ctx.beginPath();
    ctx.arc(size.x / 2, size.y / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
    if (!localData) {
        return;
    }
    for (let i = 0; i < localData.length; i++) {
        if (i == win) {
            continue;
        }
        ctx.beginPath();
        ctx.save();
        ctx.resetTransform();
        ctx.translate(
            -localData[win].x + size.x / 2,
            -localData[win].y + size.y / 2
        );
        ctx.moveTo(localData[win].x, localData[win].y);
        ctx.lineTo(localData[i].x, localData[i].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(localData[i].x, localData[i].y, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    btn.textContent = win;
}
let btn = document.getElementById("win");

aniamte();

function unload() {
    fetchLocalData();
    let tarr = localData;
    tarr.splice(win, 1);
    localStorage.setItem("centers", JSON.stringify(tarr));
}

window.addEventListener("beforeunload", (e) => {
    unload();
    b.postMessage("unloaded," + win);
});

function unloadAll() {
    localStorage.removeItem("centers");
    b.postMessage("reloadAll");
    window.location.reload();
}
