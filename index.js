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

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = 'Are you sure you want to leave? Changes you made may not be saved.';
});

function xChangeKey(value) {
    xKey = value;
    renderMap();
}

function yChangeKey(value) {
    yKey = value;
    renderMap();
}

function showPopup(content, deleteCallback) {
    const popup = document.getElementById("popup");
    popup.innerHTML = content + '<button class="close-btn" onclick="hidePopup()">X</button>' + '<button class="delete-btn" id="delete-btn">Delete</button>';
    popup.style.display = "block";
    document.getElementById("delete-btn").onclick = deleteCallback;

    // Position the popup in the bottom left
    popup.style.left = '210px';
    popup.style.bottom = '10px';

    document.addEventListener('keydown', onKeyPress);
}

function hidePopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "none";
    document.removeEventListener('keydown', onKeyPress);
}

function onKeyPress(e) {
    if (e.key === 'd') {
        const deleteButton = document.getElementById("delete-btn");
        if (deleteButton) {
            deleteButton.click();
        }
    }
}

function expandNode(id) {
    const node = nodes.find(n => n.id === id);
    const content = `
        <strong>Node: ${node.id}</strong><br>
        X: ${node[xKey]}<br>
        Y: ${node[yKey]}<br>
        ${Object.keys(node).map(key => key !== xKey && key !== yKey ? `${key}: ${node[key]}` : '').join('<br>')}
    `;
    showPopup(content, () => deleteNode(id));
}

function expandPath(from, to) {
    const path = paths.find(p => p.from === from && p.to === to);
    const firstNode = nodes.find(n => n.id === from);
    const secondNode = nodes.find(n => n.id === to);
    const content = `
        From: ${from} (X: ${firstNode[xKey]}, Y: ${firstNode[yKey]})<br>
        To: ${to} (X: ${secondNode[xKey]}, Y: ${secondNode[yKey]})<br>
        ${Object.keys(path).map(key => key !== 'from' && key !== 'to' ? `${key}: ${path[key]}` : '').join('<br>')}
    `;
    showPopup(content, () => deletePath(from, to));
}

function deleteNode(id) {
    console.log(`Deleting node with id: ${id}`);
    nodes = nodes.filter(n => n.id !== id);
    paths = paths.filter(p => p.from !== id && p.to !== id);
    console.log("Updated nodes:", nodes);
    console.log("Updated paths:", paths);
    updateMap();
    removeNodeFromSidebar(id);
    updatePathsInSidebar();
    hidePopup();
}

function deletePath(from, to) {
    console.log(`Deleting path from ${from} to ${to}`);
    paths = paths.filter(p => !(p.from === from && p.to === to) && !(p.from === to && p.to === from));
    console.log("Updated paths:", paths);
    updateMap();
    removePathFromSidebar(from, to);
    updatePathsInSidebar();
    hidePopup();
}

function updateMap() {
    map.eachLayer(layer => {
        if (layer instanceof L.Circle || layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });

    for (const path of paths) {
        let firstNode = nodes.find(n => n.id === path.from);
        let secondNode = nodes.find(n => n.id === path.to);
        L.polyline([
            [firstNode[yKey], firstNode[xKey]],
            [secondNode[yKey], secondNode[xKey]],
        ], {color: "red"}).addTo(map).on('click', (e) => expandPath(path.from, path.to, e.latlng));
    }

    for (const node of nodes) {
        L.circle([node[yKey], node[xKey]], {
            fillOpacity: 0.5,
            radius: 1,
            stroke: true,
            weight: 5,
        }).addTo(map).on('click', (e) => expandNode(node.id, e.latlng));
    }
}

function removeNodeFromSidebar(id) {
    const nodeElement = document.getElementById(`node-${id}`);
    if (nodeElement) {
        nodeElement.remove();
    }
    const nodeListTitle = document.getElementById("node-list-title");
    nodeListTitle.textContent = `Nodes (${nodes.length})`;
}

function removePathFromSidebar(from, to) {
    const pathElements = document.querySelectorAll(`#path-list div`);
    pathElements.forEach(div => {
        const button = div.querySelector('button');
        if (button && (button.textContent === `${from} to ${to}` || button.textContent === `${to} to ${from}`)) {
            console.log(`Removing path from sidebar: ${from} to ${to}`);
            div.remove();
        }
    });
    const pathListTitle = document.getElementById("path-list-title");
    pathListTitle.textContent = `Paths (${paths.length})`;
}

function updatePathsInSidebar() {
    const pathList = document.getElementById("path-list");
    let pathHtml = '';
    paths.forEach(path => {
        pathHtml += `
            <div>
                <button onclick="expandPath(${path.from}, ${path.to})">
                    ${path.from} to ${path.to}
                </button>
            </div>
        `;
    });
    pathList.innerHTML = pathHtml;
    const pathListTitle = document.getElementById("path-list-title");
    pathListTitle.textContent = `Paths (${paths.length})`;
}

function updateSidebar() {
    const nodeList = document.getElementById("node-list");
    const pathList = document.getElementById("path-list");
    const nodeListTitle = document.getElementById("node-list-title");
    const pathListTitle = document.getElementById("path-list-title");
    let nodeHtml = '';
    let pathHtml = '';

    nodes.forEach(node => {
        nodeHtml += `
            <div id=node-${node.id}>
                <button onclick="expandNode(${node.id})">
                    Node: ${node.id}
                </button>
            </div>
        `;
    });

    paths.forEach(path => {
        pathHtml += `
            <div>
                <button onclick="expandPath(${path.from}, ${path.to})">
                    ${path.from} to ${path.to}
                </button>
            </div>
        `;
    });

    nodeList.innerHTML = nodeHtml;
    pathList.innerHTML = pathHtml;

    nodeListTitle.textContent = `Nodes (${nodes.length})`;
    pathListTitle.textContent = `Paths (${paths.length})`;
}

function handleUpload() {
    const file = document.getElementById("upload").files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const jsonData = JSON.parse(e.target.result);
            const data = jsonData;
            nodes = data.nodes.slice(); // Create a copy of the nodes array
            paths = data.paths.slice(); // Create a copy of the paths array
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

    updateMap();
    updateSidebar();
}

function connectNodes() {
    const fromNode = document.getElementById("from-node").value;
    const toNode = document.getElementById("to-node").value;

    if (fromNode && toNode && fromNode !== toNode) {
        const from = parseInt(fromNode);
        const to = parseInt(toNode);

        if (nodes.find(n => n.id === from) && nodes.find(n => n.id === to)) {
            paths.push({ from, to });
            paths.push({ from: to, to: from }); // Add the reverse connection
            updateMap();
            updateSidebar();
        } else {
            alert("Invalid node IDs");
        }
    } else {
        alert("Please enter valid node IDs");
    }
}

function openFilePicker() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.nwdirectory = true;
    fileInput.onchange = (e) => {
        const filePath = e.target.files[0].path;
        document.getElementById("export-destination").value = filePath;
    };
    fileInput.click();
}

async function openDirectoryPicker() {
    try {
        const directoryHandle = await window.showDirectoryPicker();
        const directoryPath = directoryHandle.name;
        document.getElementById("export-destination").value = directoryPath;
    } catch (error) {
        console.error("Error selecting directory:", error);
    }
}

async function exportData() {
    const data = {
        nodes: nodes,
        paths: paths
    };
    const jsonData = JSON.stringify(data, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const destination = document.getElementById("export-destination").value || "data/render_export";
    const fileName = `${destination}_${timestamp}.json`;

    try {
        const directoryHandle = await window.showDirectoryPicker();
        const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(jsonData);
        await writable.close();
        console.log(`File saved to ${fileName}`);
    } catch (error) {
        console.error("Error saving file:", error);
    }
}

function addNode() {
    const x = parseFloat(document.getElementById("node-x").value);
    const y = parseFloat(document.getElementById("node-y").value);

    if (!isNaN(x) && !isNaN(y)) {
        const newNode = {
            id: nodes.length ? nodes[nodes.length - 1].id + 1 : 1,
            x: x,
            y: y
        };
        nodes.push(newNode);
        updateMap();
        updateSidebar();
    } else {
        alert("Please enter valid coordinates.");
    }
}

console.log(`
    View nodes or paths directly with:
    console.log(nodes);
    console.log(paths);
`)
