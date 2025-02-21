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

function handleUpload() {
    const file = document.getElementById("upload").files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const jsonData = JSON.parse(e.target.result);
            const data = jsonData.users[0];
            nodes = data.nodes;
            paths = data.paths;
            console.log("Set nodes and paths successfully");
            rerenderMap();
            //todo: add some validation here
        }
        reader.readAsText(file);
    }
}

function renderMap() {
    const map = document.getElementById("node-view");
    map.innerHTML = "";

    if (nodes.length === 0) return;

    const minX = Math.min(...nodes.map(node => node[xKey]));
    const maxX = Math.max(...nodes.map(node => node[xKey]));
    const minY = Math.min(...nodes.map(node => node[yKey]));
    const maxY = Math.max(...nodes.map(node => node[yKey]));

    for (const node of nodes) {
        //todo: figure out leaflet first, then render nodes
    }
}