const svg = d3.select("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight);

let nodes = [];
let links = [];

const simulation = d3.forceSimulation(nodes)
.force("link", d3.forceLink(links).id(d => d.id))
.force("charge", d3.forceManyBody().strength(-1000))
.force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
.force("centerNode", centerNodeForce(1, 0.0001));


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

function addNode() {
    const text = prompt("Enter text for the main task:", "Main Task");  
    if (text !== null && text !== "") {
        const newNode = { id: nodes.length + 1, size: 30, color: "blue", text: text };
        nodes.push(newNode);
        update();
    }
}

function addImportantTask(){
    const text = prompt("Enter text for the important task:", "Important Task");
    if (text !== null && text !== "") {
        const newNode = { id: nodes.length + 1, size: 25, color: "red", text: text };
        nodes.push(newNode);
        links.push({ source: 1, target: newNode.id });
        update();
    }
}

function addConnectedNode(event, d) {
    const text = prompt("Enter text for the new task:", "New Task");
    if (text !== null && text !== "") {
        const newNode = { id: nodes.length + 1, size: 20, color: "black", text: text };
        nodes.push(newNode);
        links.push({ source: d.id, target: newNode.id });
        update();
    }
}

function update() {
    link = link.data(links);
    link.exit().remove();
    link = link.enter().append("line").attr("class", "link").attr("stroke", "grey").merge(link);

    node = node.data(nodes);
    node.exit().remove();
    const nodeEnter = node.enter().append("g").call(drag(simulation));
    nodeEnter.append("circle")
        .attr("class", "node")
        .attr("r", d => d.size)
        .attr("fill", d => d.color)  // Set node color
        .on("click", addConnectedNode)
        .on("mouseover", handleMouseOver)  // Add hover event to show text
        .on("mouseout", handleMouseOut);   // Add hover event to hide text
    
    // Add text elements to be shown on hover
    nodeEnter.append("text")
        .attr("class", "hover-text")
        .attr("dx", 15)
        .attr("dy", -15)
        .text(d => d.text)
        .attr("visibility", "hidden");  // Hide text initially

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

function changeBackgroundColor(color) {
    d3.select("svg").style("background-color", color);
}

// Call the function to prompt for the first task
addNode();
changeBackgroundColor("lightgrey");
update();
