//todo: fill out left sidebar
//todo: color nodes and pick way to show extra data
//todo: make most of the right sidebar work
//todo: add node selection (maybe drag selection)

let nodes = [];
let paths = [];

let xKey = "x";
let yKey = "y";

let map = L.map("leaflut").setView([44.975126, -93.235599], 17);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 21,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function toggleRightBar() {
    document.getElementById("right-bar").classList.toggle("bar-collapsed");
}

function toggleLeftBar() {
    document.getElementById("left-bar").classList.toggle("bar-collapsed");
}

function xChangeKey(value) {
    xKey = value;
    renderMap();
}

function yChangeKey(value) {
    yKey = value;
    renderMap();
}

function expandNode(id) {
    const element = document.getElementById(`node-${id}`);
    console.log("Expanding node", id);
    element.classList.toggle("expanded");
}

function handleUpload() {
    const file = document.getElementById("upload").files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const jsonData = JSON.parse(e.target.result);
            const data = jsonData;
            nodes = data.nodes;
            paths = data.paths;
            console.log("Set nodes and paths");
            renderMap();
            //todo: add some validation here
        }
        reader.readAsText(file);
    }
}

function renderMap() {
    map.remove()
    map = L.map("leaflut").setView([44.975126, -93.235599], 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 21,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const nodeList = document.getElementById("node-list");
    const pathList = document.getElementById("path-list");
    nodeList.innerHTML = "";
    pathList.innerHTML = "";

    if (nodes.length === 0) return;

    for (const node of nodes) {
        L.circle([node[yKey], node[xKey]], {
            fillOpacity: 0.5,
            radius: 1,
            stroke: true,
            weight: 5,
        }).addTo(map);

        const listItem = `
            <div id=node-${node.id}>
                <button onclick="expandNode(${node.id})">
                    ${node.name ?? "Node"}
                </button>
                <div>

                </div>
            </div>
        `;

        nodeList.innerHTML += listItem;
    }

    for (const path of paths) {
        let firstNode = nodes.find(n => n.id === path.from);
        let secondNode = nodes.find(n => n.id === path.to);
        L.polyline([
            [firstNode[yKey], firstNode[xKey]],
            [secondNode[yKey], secondNode[xKey]],
        ], {color: "red"}).addTo(map);
    }
}

console.log(`
    View nodes or paths directly with:
    console.log(nodes);
    console.log(paths);
`)
