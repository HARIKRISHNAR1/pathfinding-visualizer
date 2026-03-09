function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const start = [1, 1];
const end = [8, 13];

let parent = {};
let visited = new Set();
let walls = new Set();

let draggingStart = false;
let draggingEnd = false;

function getCell(r, c) {
    return document.querySelector(`[data-row='${r}'][data-col='${c}']`);
}

function initializeGrid() {

    let startCell = getCell(start[0], start[1]);
    let endCell = getCell(end[0], end[1]);

    startCell.classList.add("start");
    startCell.innerHTML = "S";

    endCell.classList.add("end");
    endCell.innerHTML = "E";
}

document.addEventListener("DOMContentLoaded", function () {

    initializeGrid();

    document.querySelectorAll(".cell").forEach(cell => {

        cell.addEventListener("mousedown", () => {

            let r = parseInt(cell.dataset.row);
            let c = parseInt(cell.dataset.col);

            if (r === start[0] && c === start[1]) {
                draggingStart = true;
                return;
            }

            if (r === end[0] && c === end[1]) {
                draggingEnd = true;
                return;
            }

            toggleWall(cell);
        });

        cell.addEventListener("mouseenter", () => {

            let r = parseInt(cell.dataset.row);
            let c = parseInt(cell.dataset.col);

            if (draggingStart) moveStart(r, c);
            if (draggingEnd) moveEnd(r, c);

        });

    });

});

document.addEventListener("mouseup", () => {
    draggingStart = false;
    draggingEnd = false;
});

function toggleWall(cell) {

    let r = parseInt(cell.dataset.row);
    let c = parseInt(cell.dataset.col);

    if ((r === start[0] && c === start[1]) ||
        (r === end[0] && c === end[1])) return;

    let key = [r, c].toString();

    if (walls.has(key)) {
        walls.delete(key);
        cell.classList.remove("wall");
    } else {
        walls.add(key);
        cell.classList.add("wall");
    }
}

function moveStart(r, c) {

    if (walls.has([r, c].toString())) return;

    let oldCell = getCell(start[0], start[1]);
    oldCell.classList.remove("start");
    oldCell.innerHTML = "";

    start[0] = r;
    start[1] = c;

    let newCell = getCell(r, c);
    newCell.classList.add("start");
    newCell.innerHTML = "S";
}

function moveEnd(r, c) {

    if (walls.has([r, c].toString())) return;

    let oldCell = getCell(end[0], end[1]);
    oldCell.classList.remove("end");
    oldCell.innerHTML = "";

    end[0] = r;
    end[1] = c;

    let newCell = getCell(r, c);
    newCell.classList.add("end");
    newCell.innerHTML = "E";
}

function startAlgorithm() {

    clearPath();

    let selected = document.getElementById("algorithmSelect").value;

    if (selected === "bfs") runBFS();
    else if (selected === "dfs") runDFS();
    else if (selected === "astar") runAStar();
}

async function runBFS() {

    parent = {};
    visited = new Set();

    let queue = [];
    queue.push(start);
    visited.add(start.toString());

    const directions = [
        [1,0], [-1,0], [0,1], [0,-1]
    ];

    while (queue.length > 0) {

        let [r, c] = queue.shift();

        if (r === end[0] && c === end[1]) {
            await reconstructPath();
            return;
        }

        for (let [dr, dc] of directions) {

            let nr = r + dr;
            let nc = c + dc;
            let key = [nr, nc].toString();

            if (
                nr >= 0 && nr < ROWS &&
                nc >= 0 && nc < COLS &&
                !visited.has(key) &&
                !walls.has(key)
            ) {

                queue.push([nr, nc]);
                visited.add(key);
                parent[key] = [r, c];

                if (!(nr === end[0] && nc === end[1])) {
                    getCell(nr, nc).classList.add("visited");
                    await sleep(40);
                }
            }
        }
    }

    alert("No Path Found");
}

async function runDFS() {

    parent = {};
    visited = new Set();

    let stack = [start];

    const directions = [
        [1,0], [-1,0], [0,1], [0,-1]
    ];

    while (stack.length > 0) {

        let [r, c] = stack.pop();
        let key = [r, c].toString();

        if (visited.has(key)) continue;

        visited.add(key);

        if (!(r === start[0] && c === start[1]) &&
            !(r === end[0] && c === end[1])) {

            getCell(r, c).classList.add("visited");
            await sleep(40);
        }

        if (r === end[0] && c === end[1]) {
            await reconstructPath();
            return;
        }

        for (let [dr, dc] of directions) {

            let nr = r + dr;
            let nc = c + dc;
            let nkey = [nr, nc].toString();

            if (
                nr >= 0 && nr < ROWS &&
                nc >= 0 && nc < COLS &&
                !visited.has(nkey) &&
                !walls.has(nkey)
            ) {

                stack.push([nr, nc]);

                if (!(nkey in parent))
                    parent[nkey] = [r, c];
            }
        }
    }
}

async function runAStar() {

    parent = {};
    visited = new Set();

    let open = [];
    open.push(start);

    let g = {};
    let f = {};

    g[start.toString()] = 0;
    f[start.toString()] = heuristic(start, end);

    const directions = [
        [1,0], [-1,0], [0,1], [0,-1]
    ];

    while (open.length > 0) {

        open.sort((a,b)=>f[a.toString()] - f[b.toString()]);
        let [r,c] = open.shift();

        if (r === end[0] && c === end[1]) {
            await reconstructPath();
            return;
        }

        visited.add([r,c].toString());

        if (!(r === start[0] && c === start[1])) {
            getCell(r,c).classList.add("visited");
            await sleep(40);
        }

        for (let [dr,dc] of directions) {

            let nr=r+dr;
            let nc=c+dc;
            let key=[nr,nc].toString();

            if (
                nr>=0 && nr<ROWS &&
                nc>=0 && nc<COLS &&
                !walls.has(key)
            ){

                let tempG = g[[r,c].toString()] + 1;

                if (!(key in g) || tempG < g[key]) {

                    parent[key] = [r,c];
                    g[key] = tempG;
                    f[key] = tempG + heuristic([nr,nc],end);

                    if (!open.some(n=>n.toString()===key))
                        open.push([nr,nc]);
                }
            }
        }
    }

    alert("No Path Found");
}

function heuristic(a,b){
    return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]);
}

async function reconstructPath() {

    let current = end;

    while (current.toString() !== start.toString()) {

        await sleep(60);

        let key = current.toString();
        let [r,c] = current;

        if (!(r === end[0] && c === end[1])) {
            getCell(r,c).classList.remove("visited");
            getCell(r,c).classList.add("path");
        }

        current = parent[key];
    }
}

function clearWalls(){

    walls.clear();

    document.querySelectorAll(".cell").forEach(cell=>{
        cell.classList.remove("wall");
    });
}

function clearPath(){

    document.querySelectorAll(".cell").forEach(cell=>{
        cell.classList.remove("visited");
        cell.classList.remove("path");
    });
}