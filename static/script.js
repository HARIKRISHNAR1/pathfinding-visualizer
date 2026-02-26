const start = [2, 3];
const end = [8, 12];

let parent = {};
let visited = new Set();
let walls = new Set();   // Store wall nodes

function getCell(r, c) {
    return document.querySelector(`[data-row='${r}'][data-col='${c}']`);
}

function initializeGrid() {
    getCell(start[0], start[1]).classList.add("start");
    getCell(end[0], end[1]).classList.add("end");
}

initializeGrid();


// 🧱 WALL CREATION
document.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("click", () => {

        let r = parseInt(cell.dataset.row);
        let c = parseInt(cell.dataset.col);

        // Prevent start and end from becoming walls
        if ((r === start[0] && c === start[1]) ||
            (r === end[0] && c === end[1])) {
            return;
        }

        let key = [r, c].toString();

        if (walls.has(key)) {
            walls.delete(key);
            cell.classList.remove("wall");
        } else {
            walls.add(key);
            cell.classList.add("wall");
        }
    });
});


function runBFS() {

    // Reset previous run (except walls)
    document.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("visited", "path");
    });

    parent = {};
    visited = new Set();

    let queue = [];
    queue.push(start);
    visited.add(start.toString());

    const directions = [
        [1,0], [-1,0], [0,1], [0,-1],
        [1,1], [1,-1], [-1,1], [-1,-1]
    ];

    while(queue.length > 0) {

        let [r, c] = queue.shift();

        if (r === end[0] && c === end[1]) {
            reconstructPath();
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
                !walls.has(key)      // 🚫 Do not pass through walls
            ) {
                queue.push([nr, nc]);
                visited.add(key);
                parent[key] = [r, c];

                if (!(nr === end[0] && nc === end[1])) {
                    getCell(nr, nc).classList.add("visited");
                }
            }
        }
    }

    alert("No Path Found!");
}


function reconstructPath() {

    let current = end;

    while (current.toString() !== start.toString()) {

        let key = current.toString();
        let [r, c] = current;

        if (!(r === end[0] && c === end[1])) {
            getCell(r, c).classList.remove("visited");
            getCell(r, c).classList.add("path");
        }

        current = parent[key];
    }
}