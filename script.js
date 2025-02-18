const svg = d3.select("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight);

let nodes = [];
let links = [];

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links)
        .id(d => d.id)
        .distance(75)
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force("collision", d3.forceCollide()
    .radius(d => d.size + 5)
);


let link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", "link")
    .attr("stroke", "grey");

let node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .call(drag(simulation));

node.append("circle")
    .attr("class", "node")
    .attr("r", d => d.size)
    .attr("fill", d => d.color)  // Set node color
    .on("click", addConnectedNode)  // Add click event to create connected node
    .on("mouseover", handleMouseOver)  // Add hover event to show text
    .on("mouseout", handleMouseOut);   // Add hover event to hide text

// Add text elements to be shown on hover
node.append("text")
    .attr("class", "hover-text")
    .attr("dx", 15)
    .attr("dy", -15)
    .text(d => d.text)
    .attr("visibility", "hidden");  // Hide text initially

simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node.attr("transform", d => {
        d.x = Math.max(0, Math.min(window.innerWidth, d.x));
        d.y = Math.max(0, Math.min(window.innerHeight, d.y));
        return `translate(${d.x},${d.y})`;
    });
});

function drag(simulation) {
    return d3.drag()
        .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        })
        .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        })
        .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        });
}

function generateUniqueId() {
    return 'node-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}


function addImportantTask(){
    const text = prompt("Enter text for the important task:", "Important Task");
    if (text !== null && text !== "") {
        const newNode = { 
            id: generateUniqueId(),  // Use the updated unique ID generator
            size: 30, 
            color: "red", 
            text: text,
            x: window.innerWidth / 2, 
            y: window.innerHeight / 2 
        };
        nodes.push(newNode);

        // Update the simulation and visualization
        simulation.nodes(nodes);
        simulation.alpha(1).restart();
        update();
    }
}


function addConnectedNode(event, d) {
    const text = prompt("Enter text for the new task:", "New Task");
    if (text !== null && text !== "") {
        const newNode = { 
            id: generateUniqueId(),  // Use the updated unique ID generator
            size: 20, 
            color: "black", 
            text: text,
            x: d.x + 50,  // Position near the parent node
            y: d.y + 50
        };
        nodes.push(newNode);
        links.push({ source: d.id, target: newNode.id });

        // Update the simulation and visualization
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();
        update();
    }
}


function update() {
    // UPDATE LINKS
    link = link.data(links, d => `${d.source}-${d.target}`);

    // EXIT old links
    link.exit().remove();

    // ENTER new links
    link = link.enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke", "grey")
        .merge(link);

    // UPDATE NODES
    node = node.data(nodes, d => d.id);

    // EXIT old nodes
    node.exit().remove();

    // ENTER new nodes
    const nodeEnter = node.enter()
        .append("g")
        .call(drag(simulation));

    nodeEnter.append("circle")
        .attr("class", "node")
        .attr("r", d => d.size)
        .attr("fill", d => d.color)
        .on("click", addConnectedNode)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    nodeEnter.append("text")
        .attr("class", "hover-text")
        .attr("dx", 15)
        .attr("dy", -15)
        .text(d => d.text)
        .attr("visibility", "hidden");

    node = nodeEnter.merge(node);

    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
}

function handleMouseOver(event, d) {
    d3.select(this.parentNode).select("text").attr("visibility", "visible");
}

function handleMouseOut(event, d) {
    d3.select(this.parentNode).select("text").attr("visibility", "hidden");
}

function centerNodeForce(targetId, strength) {
    return (alpha) => {
        nodes.forEach(node => {
            if (node.id === targetId) {
                node.vx -= (node.x - 480) * strength * alpha;
                node.vy -= (node.y - 250) * strength * alpha;
            }
        });
    };
}

function saveGraph() {
    const graphData = {
        nodes: nodes,
        links: links
    };
    const dataStr = JSON.stringify(graphData);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const name = prompt("Enter the file name:", "save");
    const exportFileDefaultName = name + '.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
}


function loadGraph(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const graphData = JSON.parse(e.target.result);

            // Clear existing nodes and links
            nodes.splice(0, nodes.length);
            links.splice(0, links.length);

            // Recreate nodes using original IDs and properties
            graphData.nodes.forEach((node) => {
                const newNode = {
                    id: node.id,  // Preserve the original ID
                    size: node.size,
                    color: node.color,
                    text: node.text,
                    x: node.x,
                    y: node.y,
                    vx: node.vx || 0,
                    vy: node.vy || 0
                };
                nodes.push(newNode);
            });

            // Recreate links using node IDs
            graphData.links.forEach(link => {
                const newLink = {
                    source: link.source.id ? link.source.id : link.source,
                    target: link.target.id ? link.target.id : link.target
                };
                links.push(newLink);
            });

            // Update the simulation
            simulation.nodes(nodes);
            simulation.force("link")
                .links(links)
                .id(d => d.id);  // Ensure the simulation uses node IDs

            simulation.alpha(1).restart();

            // Update the visualization
            update();
        };
        reader.readAsText(file);
    }
}

function settingsMenu() {
    document.getElementById("settingsPopup").style.display = "block";
}

function closeSettingsMenu() {
    document.getElementById("settingsPopup").style.display = "none";
}

function changeBackgroundColor(colorPicker) {
    let color = colorPicker.value;
    d3.select("svg").style("background-color", color);
}

// Call the function to prompt for the first task
addNode();
changeBackgroundColor("lightgrey");
update();
