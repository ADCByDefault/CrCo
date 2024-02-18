/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");
/**
 * @type {CanvasRenderingContext2D}
 */
const ctx = canvas.getContext("2d");
const buttons = Array.from(document.querySelectorAll("[data-btn]"));
const brushContainer = document.getElementById("brushContainer");
const addBrush = document.getElementById("addBrush");
const brushes = [];
const mouse = {
    x: 0,
    y: 0,
    down: false,
    previousX: 0,
    previousY: 0,
};
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("load", (e) => {
    resizeCanvas();
    selected = document.querySelector("button[data-selected = 'true']");
    let localData = JSON.parse(localStorage.getItem("brushes"));
    if (localData) {
        localData.forEach((data) => {
            let b = new Shape(
                ctx,
                data.innerR,
                data.outterR,
                data.n * 2,
                data.rotation,
                data.origin,
                data.options
            );
            brushes.push(b);
        });
    }
    updateBrushContainer();
});
buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
        console.log("calling function: " + e.target.getAttribute("data-btn"));
        callFunction(e.target);
    });
    return;
});
/**
 *
 * @param {HTMLButtonElement} button
 */
function callFunction(button) {
    const value = button.getAttribute("data-btn");
    try {
        switch (value) {
            case "clear":
                clear();
                break;

            default:
                console.error("No function found");
                break;
        }
    } catch (error) {
        console.error(error);
    }
}
window.addEventListener("resize", (e) => {
    resizeCanvas();
});
window.addEventListener("mousedown", (e) => {
    mouse.down = true;
    draw();
});
window.addEventListener("mouseup", (e) => {
    mouse.down = false;
});
window.addEventListener("mousemove", (e) => {
    mouse.previousX = mouse.x;
    mouse.previousY = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (mouse.down) {
        draw();
    }
});
class Color {
    constructor(color) {
        this.color = color;
    }
    get color() {
        return this.color;
    }
    set color(color) {
        this.color = color;
    }
    static createRandomColor(h, s, l) {
        h = h ? h : { min: 0, max: 360 };
        s = s ? s : { min: 100, max: 100 };
        l = l ? l : { min: 50, max: 50 };
        let ht = Math.floor(Math.random() * (h.max - h.min + 1)) + h.min;
        let st = Math.floor(Math.random() * (s.max - s.min + 1)) + s.min;
        let lt = Math.floor(Math.random() * (l.max - l.min + 1)) + l.min;

        return `hsl(${ht},${st}%,${lt}%)`;
    }
}
class Shape {
    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} innerR
     * @param {number} outterR
     * @param {number} n
     * @param {number} rotation
     * @param {{x:number, y:number}} origin
     * @param {*} options
     */
    constructor(ctx, innerR, outterR, n, rotation, origin, options) {
        this.innerR = innerR ? innerR : 20;
        this.outterR = outterR ? outterR : 20;
        n = n ? n / 2 : 2;
        this.n = n;
        this.rotation = rotation ? rotation : 0;
        this.origin = origin ? origin.x && origin.y : { x: 0, y: 0 };
        this.ctx = ctx;
        this.options = {
            fillStyle: Color.createRandomColor(),
            strokeStyle: Color.createRandomColor(),
            lineWidth: 2,
            shadowColor: Color.createRandomColor(),
            shadowBlur: 6,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            ...options,
        };
        this.angle = {
            angle: (Math.PI * 2) / n,
            angleCos: Math.cos((Math.PI * 2) / n),
            AngleSin: Math.sin((Math.PI * 2) / n),
            halfAngle: (Math.PI * 2) / (n * 2),
            halfAngleCos: Math.cos((Math.PI * 2) / (n * 2)),
            halfAngleSin: Math.sin((Math.PI * 2) / (n * 2)),
        };
    }
    draw(pos) {
        pos = pos ? (pos.x && pos.y ? pos : mouse) : mouse;
        let angle = this.angle;
        /**
         * @type {CanvasRenderingContext2D}
         */
        let ctx = this.ctx;
        ctx.save();
        this.setOptionsToContext();
        ctx.translate(pos.x, pos.y);
        {
            //debug
            // ctx.beginPath();
            // ctx.arc(0, 0, this.innerR, 0, Math.PI * 2);
            // ctx.stroke();
            // ctx.beginPath();
            // ctx.arc(0, 0, this.outterR, 0, Math.PI * 2);
            // ctx.stroke();
        }
        ctx.beginPath();
        this.rotation += this.rotation;
        this.rotation = this.rotation % (Math.PI * 2);
        ctx.moveTo(this.outterR, 0);
        for (let i = 0; i < this.n; i++) {
            ctx.lineTo(
                angle.halfAngleCos * this.innerR,
                angle.halfAngleSin * this.innerR
            );
            ctx.lineTo(
                angle.angleCos * this.outterR,
                angle.AngleSin * this.outterR
            );
            ctx.rotate(angle.angle);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
    setOptionsToContext() {
        let ctx = this.ctx;
        for (const key in this.options) {
            if (this.options.hasOwnProperty(key)) {
                ctx[key] = this.options[key];
            }
        }
    }
}
let s1 = new Shape(ctx, 5, 5, 4, 0, undefined);
let animationRequest = null;
function animate() {
    animationRequest = window.requestAnimationFrame(animate);
    deltaTime = new Date().getTime();
    showMousePosition();
}
animate();

function showMousePosition() {
    document.getElementById(
        "mouseInfo"
    ).innerText = `x: ${mouse.x}, y: ${mouse.y}, ${mouse.down}`;
}

function draw() {
    brushes.forEach((brush) => {
        brush.draw();
    });
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateBrushContainer() {
    const bs = brushContainer.querySelectorAll("[data-brush]");
    bs.forEach((b) => {
        b.remove();
    });
    brushes.forEach((brush, i) => {
        let div = document.createElement("div");
        div.setAttribute("data-brush", i);
        div.classList.add("drop-item");
        div.innerHTML = `Brush ${i + 1}`;
        brushContainer.appendChild(div);
    });
}
