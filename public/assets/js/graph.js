// Define preset queries
const presetQueries = [
  {
    name: "Movies and Actors (Limited)",
    query: `MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) RETURN p, r, m LIMIT 25`
  },
  {
    name: "Directors and Movies (Limited)",
    query: `MATCH (p:Person)-[r:DIRECTED]->(m:Movie) RETURN p, r, m LIMIT 25`
  },
  {
    name: "Movie Genres (Limited)",
    query: `MATCH (m:Movie)-[r:IS_GENRE]->(g:Genre) RETURN m, r, g LIMIT 25`
  },
  {
    name: "All Movies (Limited)",
    query: `MATCH (m:Movie) RETURN m LIMIT 50`
  },
  {
    name: "All People (Limited)",
    query: `MATCH (p:Person) RETURN p LIMIT 50`
  },
  {
    name: "Actor Collaborations",
    query: `MATCH (actor:Person)-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(coActor:Person)
            WHERE actor.name = "Tom Hanks"
            RETURN actor, m, coActor LIMIT 30`
  }
];

// Global zoom variable
let currentZoom;

// Execute query when Run Query button is clicked
document.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners
  document.querySelector('#query-btn').addEventListener('click', executeQuery);
  
  // Set up sidebar toggle
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('#sidebar-toggle');
  const sidebarToggleIcon = document.querySelector('#sidebar-toggle-icon');
  
  if (sidebar && sidebarToggle && sidebarToggleIcon) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      if (sidebar.classList.contains('collapsed')) {
        sidebarToggleIcon.classList.remove('fa-chevron-left');
        sidebarToggleIcon.classList.add('fa-chevron-right');
      } else {
        sidebarToggleIcon.classList.remove('fa-chevron-right');
        sidebarToggleIcon.classList.add('fa-chevron-left');
      }
    });
  }
  
  // Set up results panel toggle
  const resultsPanel = document.querySelector('.results-panel');
  const resultsToggle = document.querySelector('#results-toggle');
  const resultsToggleIcon = document.querySelector('#results-toggle-icon');
  
  if (resultsPanel && resultsToggle && resultsToggleIcon) {
    resultsToggle.addEventListener('click', () => {
      resultsPanel.classList.toggle('collapsed');
      if (resultsPanel.classList.contains('collapsed')) {
        resultsToggleIcon.classList.remove('fa-chevron-down');
        resultsToggleIcon.classList.add('fa-chevron-up');
      } else {
        resultsToggleIcon.classList.remove('fa-chevron-up');
        resultsToggleIcon.classList.add('fa-chevron-down');
      }
    });

    const querySelect = document.querySelector('#query-select');
const queryInput = document.querySelector('#cypher-query');

if (querySelect && queryInput) {
  querySelect.addEventListener('change', () => {
    const selectedOption = querySelect.options[querySelect.selectedIndex];
    if (selectedOption.value !== '') {
      const query = selectedOption.getAttribute('data-query');
      if (query) {
        queryInput.value = query;
      }
    } else {
      queryInput.value = '';
    }
  });
}
  }
  
  // Set up zoom controls
  const svg = d3.select('#graph-svg').size() > 0 ? d3.select('#graph-svg') : d3.select('svg');
  
  const zoomIn = document.querySelector('#zoom-in');
  const zoomOut = document.querySelector('#zoom-out');
  const zoomReset = document.querySelector('#zoom-reset');
  
  if (zoomIn) {
    zoomIn.addEventListener('click', () => {
      svg.transition().duration(300).call(currentZoom.scaleBy, 1.5);
    });
  }
  
  if (zoomOut) {
    zoomOut.addEventListener('click', () => {
      svg.transition().duration(300).call(currentZoom.scaleBy, 0.75);
    });
  }
  
  if (zoomReset) {
    zoomReset.addEventListener('click', () => {
      svg.transition().duration(500).call(currentZoom.transform, d3.zoomIdentity);
    });
  }
  
  // Populate preset queries dropdown
  const querySelect = document.querySelector('#query-select');
  
  if (querySelect && querySelect.children.length === 0) {
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select a preset query --';
    querySelect.appendChild(defaultOption);
    
    // Add preset queries
    presetQueries.forEach((preset, index) => {
      const option = document.createElement('option');
      option.value = index.toString();
      option.textContent = preset.name;
      querySelect.appendChild(option);
    });
    
    // Set up change listener for the dropdown
    querySelect.addEventListener('change', () => {
      const selectedIndex = querySelect.value;
      if (selectedIndex !== '') {
        const queryInput = document.querySelector('#cypher-query');
        const selectedQuery = presetQueries[parseInt(selectedIndex)];
        queryInput.value = selectedQuery.query;
      }
    });
    
    // Set default query
    const queryInput = document.querySelector('#cypher-query');
    if (queryInput) {
      queryInput.value = presetQueries[0].query;
    }
  }
  
  // Handle legacy UI elements if using the old layout
  const oldQuerySelect = document.getElementById('query-select');
  if (!document.querySelector('.app-container') && !oldQuerySelect) {
    // Create query select dropdown
    const querySelect = document.createElement('select');
    querySelect.id = 'query-select';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select a preset query --';
    querySelect.appendChild(defaultOption);
    
    // Add preset queries to dropdown
    presetQueries.forEach((preset, index) => {
      const option = document.createElement('option');
      option.value = index.toString();
      option.textContent = preset.name;
      querySelect.appendChild(option);
    });
    
    // Style the dropdown
    querySelect.style.position = 'fixed';
    querySelect.style.top = '40px';
    querySelect.style.left = '0';
    querySelect.style.width = '100%';
    querySelect.style.padding = '.5em';
    querySelect.style.zIndex = '10';
    querySelect.style.fontFamily = 'Trebuchet MS, Lucida Sans Unicode, Lucida Grande, sans-serif';
    
    // Add dropdown to page
    document.body.appendChild(querySelect);
    
    // Set up change listener for the dropdown
    querySelect.addEventListener('change', () => {
      const selectedIndex = querySelect.value;
      if (selectedIndex !== '') {
        const queryInput = document.querySelector('#cypher-query');
        const selectedQuery = presetQueries[parseInt(selectedIndex)];
        queryInput.value = selectedQuery.query;
      }
    });
    
    // Adjust the cypher query input position to make room for the dropdown
    const queryInput = document.querySelector('#cypher-query');
    if (queryInput) {
      queryInput.style.top = '80px';
    }
    
    // Adjust the run query button position
    const queryBtn = document.querySelector('#query-btn');
    if (queryBtn) {
      queryBtn.style.top = '80px';
    }
    
    // Add space at the top of the SVG
    const svg = document.querySelector('svg');
    if (svg) {
      svg.style.marginTop = '120px';
      svg.style.height = 'calc(100vh - 320px)';
    }
    
    // Set default query
    if (queryInput) {
      queryInput.value = presetQueries[0].query;
    }
  }
});

// Function to execute the current query
function executeQuery() {
  // Get and encode the query
  const queryInput = document.querySelector('#cypher-query');
  let queryValue = queryInput.value;
  
  // If query is empty, show an error
  if (!queryValue.trim()) {
    alert("Please enter a Cypher query or select a preset query");
    return;
  }
  
  const encodedQuery = encodeURIComponent(queryValue);
  
  // Check if we're using the new UI or the old one
  const isNewUI = document.querySelector('.app-container') !== null;
  
  if (isNewUI) {
    // Update results panel
    const resultsStats = document.querySelector('#results-stats');
    const resultsDetails = document.querySelector('#results-details');
    
    resultsStats.innerHTML = '<p>Loading...</p>';
    resultsDetails.innerHTML = '';
    
    // Ensure results panel is expanded
    const resultsPanel = document.querySelector('.results-panel');
    resultsPanel.classList.remove('collapsed');
    const resultsToggleIcon = document.querySelector('#results-toggle-icon');
    resultsToggleIcon.classList.remove('fa-chevron-up');
    resultsToggleIcon.classList.add('fa-chevron-down');
  } else {
    // Legacy UI: Create a results container if it doesn't exist
    if (!document.getElementById('results-container')) {
      const resultsContainer = document.createElement('div');
      resultsContainer.id = 'results-container';
      resultsContainer.style.position = 'fixed';
      resultsContainer.style.bottom = '0';
      resultsContainer.style.left = '0';
      resultsContainer.style.width = '100%';
      resultsContainer.style.height = '200px';
      resultsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      resultsContainer.style.overflowY = 'auto';
      resultsContainer.style.padding = '10px';
      resultsContainer.style.boxSizing = 'border-box';
      resultsContainer.style.borderTop = '1px solid #ccc';
      document.body.appendChild(resultsContainer);
    }
    
    // Show loading message
    document.getElementById('results-container').innerHTML = 'Loading...';
  }
  
  fetch(`/graph?cypher=${encodedQuery}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      if (isNewUI) {
        // New UI: Update results panel
        const resultsStats = document.querySelector('#results-stats');
        const resultsDetails = document.querySelector('#results-details');
        
        resultsStats.innerHTML = `
          <h3>Summary</h3>
          <p><strong>Nodes:</strong> ${data.nodes.length}</p>
          <p><strong>Relationships:</strong> ${data.links.length}</p>
          <button id="toggle-details" class="query-btn">
            <i class="fas fa-code"></i> Show/Hide Raw Data
          </button>
        `;
        
        resultsDetails.innerHTML = `
          <div id="details-section" style="display:none">
            <h4>Nodes:</h4>
            <pre>${JSON.stringify(data.nodes.slice(0, 5), null, 2)}${data.nodes.length > 5 ? '\n... and ' + (data.nodes.length - 5) + ' more' : ''}</pre>
            <h4>Relationships:</h4>
            <pre>${JSON.stringify(data.links.slice(0, 5), null, 2)}${data.links.length > 5 ? '\n... and ' + (data.links.length - 5) + ' more' : ''}</pre>
          </div>
        `;
      } else {
        // Legacy UI: Display raw data in the results container
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = `
          <h3>Query Results:</h3>
          <p><strong>Nodes:</strong> ${data.nodes.length}</p>
          <p><strong>Relationships:</strong> ${data.links.length}</p>
          <button id="toggle-details">Show/Hide Details</button>
          <div id="details-section" style="display:none">
            <h4>Nodes:</h4>
            <pre>${JSON.stringify(data.nodes, null, 2)}</pre>
            <h4>Relationships:</h4>
            <pre>${JSON.stringify(data.links, null, 2)}</pre>
          </div>
        `;
      }
      
      // Add event listener to toggle button
      document.getElementById('toggle-details').addEventListener('click', () => {
        const details = document.getElementById('details-section');
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
      });
      
      // Only try to create visualization if we have nodes
      if (data.nodes.length > 0) {
        try {
          renderGraph(data);
        } catch (err) {
          console.error("Error creating visualization:", err);
          
          if (isNewUI) {
            document.querySelector('#results-stats').innerHTML += `
              <p style="color: red;">Error creating visualization: ${err.message}</p>
            `;
          } else {
            document.getElementById('results-container').innerHTML += `
              <p style="color: red;">Error creating visualization: ${err.message}</p>
            `;
          }
        }
      } else {
        const message = `<p>No nodes were returned from the query. Please modify your query.</p>`;
        
        if (isNewUI) {
          document.querySelector('#results-stats').innerHTML += message;
        } else {
          document.getElementById('results-container').innerHTML += message;
        }
      }
    })
    .catch(error => {
      console.error(`Error fetching graph data:`, error);
      
      const errorMessage = `
        <h3>Error:</h3>
        <p style="color: red;">${error.message}</p>
        <p>Please check your query and ensure the server is running correctly.</p>
      `;
      
      if (isNewUI) {
        document.querySelector('#results-stats').innerHTML = errorMessage;
      } else {
        document.getElementById('results-container').innerHTML = errorMessage;
      }
    });
}

// Function to get a deterministic color based on a string
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Get a more visually pleasing palette using HSL
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
}

// Function to get a property from an object that would make a good label
function getBestLabelProperty(properties) {
  const priorityProps = ['name', 'title', 'id', 'label', 'type'];
  
  for (const prop of priorityProps) {
    if (properties[prop] !== undefined) {
      return { name: prop, value: properties[prop] };
    }
  }
  
  // If no priority property is found, return the first string property
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string') {
      return { name: key, value: value };
    }
  }
  
  // If no string property, return the first property
  const entries = Object.entries(properties);
  if (entries.length > 0) {
    return { name: entries[0][0], value: entries[0][1] };
  }
  
  // No properties at all
  return { name: null, value: null };
}

// Create node tooltip content
function createNodeTooltip(d) {
  let tooltipContent = `<div class="tooltip-title">${d.label}</div>`;
  
  // Add properties table
  tooltipContent += '<table class="tooltip-properties">';
  for (const [key, value] of Object.entries(d.properties)) {
    tooltipContent += `
      <tr>
        <td class="property-name">${key}</td>
        <td class="property-value">${value}</td>
      </tr>
    `;
  }
  tooltipContent += '</table>';
  
  return tooltipContent;
}

// Create relationship tooltip content
function createRelationshipTooltip(d) {
  let tooltipContent = `<div class="tooltip-title">${d.type}</div>`;
  
  // Add properties table if any properties exist
  if (d.properties && Object.keys(d.properties).length > 0) {
    tooltipContent += '<table class="tooltip-properties">';
    for (const [key, value] of Object.entries(d.properties)) {
      tooltipContent += `
        <tr>
          <td class="property-name">${key}</td>
          <td class="property-value">${value}</td>
        </tr>
      `;
    }
    tooltipContent += '</table>';
  }
  
  return tooltipContent;
}

// Separate function for rendering the graph
function renderGraph(data) {
  // Check if we're using the new UI or the old one
  const isNewUI = document.querySelector('.app-container') !== null;
  
  // Get the appropriate SVG element
  const svg = isNewUI ? 
    d3.select('#graph-svg') : 
    d3.select('svg');
  
  // Determine dimensions
  let width, height;
  
  if (isNewUI) {
    width = svg.node().parentElement.clientWidth;
    height = svg.node().parentElement.clientHeight;
  } else {
    width = window.innerWidth;
    height = window.innerHeight - 320; // Adjust for header and results panel
  }
  
  // Clear SVG stage from previous query
  svg.selectAll('*').remove();
  
  // First, create a deep copy of the data to avoid modifying the original
  const graphData = {
    nodes: JSON.parse(JSON.stringify(data.nodes)),
    links: JSON.parse(JSON.stringify(data.links))
  };
  
  // Create a map of nodes by id for easy lookup
  const nodeById = new Map(graphData.nodes.map(node => [node.id, node]));
  
  // Filter out any links that reference non-existent nodes
  const validLinks = graphData.links.filter(link => 
    nodeById.has(typeof link.source === 'object' ? link.source.id : link.source) && 
    nodeById.has(typeof link.target === 'object' ? link.target.id : link.target)
  );
  
  // Update link references to be objects instead of ids
  validLinks.forEach(link => {
    if (typeof link.source === 'string') {
      link.source = nodeById.get(link.source);
    }
    if (typeof link.target === 'string') {
      link.target = nodeById.get(link.target);
    }
  });
  
  console.log("Rendering graph with:", graphData.nodes.length, "nodes and", validLinks.length, "links");
  
  // Collect all unique node labels and relationship types for legend
  const nodeLabels = new Set();
  graphData.nodes.forEach(node => {
    const labels = node.label.split(' ');
    labels.forEach(label => nodeLabels.add(label));
  });
  
  const relTypes = new Set();
  validLinks.forEach(link => {
    relTypes.add(link.type);
  });
  
  // Generate a color map for node labels
  const labelColors = {};
  Array.from(nodeLabels).forEach(label => {
    labelColors[label] = stringToColor(label);
  });
  
  // Generate a color map for relationship types
  const relColors = {};
  Array.from(relTypes).forEach(type => {
    relColors[type] = stringToColor(type);
  });
  
  // Create or update tooltip
  let tooltip = d3.select("body").select(".tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "10px")
      .style("box-shadow", "0 0 10px rgba(0,0,0,0.1)")
      .style("pointer-events", "none")
      .style("max-width", "300px")
      .style("font-size", "12px")
      .style("z-index", "1000");
  }
  
  // Create D3.js simulation with several forces
  const simulation = d3.forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(validLinks).id(d => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide(60));

  // Create a root group that will be transformed during zoom
  const g = svg.append("g").attr("class", "zoom-group");
  
  // Create zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 10])  // Set min/max zoom scale
    .on("zoom", (event) => {
      // Apply the zoom transform to all elements in the root group
      g.attr("transform", event.transform);
    });
  
  // Apply zoom behavior to SVG
  svg.call(zoom);
  
  // Reset zoom to initial position
  svg.call(zoom.transform, d3.zoomIdentity);
  
  // Update global zoom reference
  currentZoom = zoom;
  
  // Only add legacy zoom controls if using old UI
  if (!isNewUI) {
    // Add zoom controls
    const zoomControls = svg.append("g")
      .attr("class", "zoom-controls")
      .attr("transform", "translate(20, 20)");
    
    // Add zoom in button
    const zoomInBtn = zoomControls.append("g")
      .attr("class", "zoom-button")
      .style("cursor", "pointer");
    
    zoomInBtn.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30)
      .attr("rx", 5)
      .attr("fill", "rgba(255, 255, 255, 0.8)")
      .attr("stroke", "#ccc");
    
    zoomInBtn.append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("pointer-events", "none")
      .text("+");
    
    zoomInBtn.on("click", () => {
      svg.transition().duration(300).call(zoom.scaleBy, 1.5);
    });
    
    // Add zoom out button
    const zoomOutBtn = zoomControls.append("g")
      .attr("class", "zoom-button")
      .attr("transform", "translate(0, 40)")
      .style("cursor", "pointer");
    
    zoomOutBtn.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30)
      .attr("rx", 5)
      .attr("fill", "rgba(255, 255, 255, 0.8)")
      .attr("stroke", "#ccc");
    
    zoomOutBtn.append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("pointer-events", "none")
      .text("−");
    
    zoomOutBtn.on("click", () => {
      svg.transition().duration(300).call(zoom.scaleBy, 0.75);
    });
    
    // Add reset zoom button
    const resetBtn = zoomControls.append("g")
      .attr("class", "zoom-button")
      .attr("transform", "translate(0, 80)")
      .style("cursor", "pointer");
    
    resetBtn.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30)
      .attr("rx", 5)
      .attr("fill", "rgba(255, 255, 255, 0.8)")
      .attr("stroke", "#ccc");
    
    resetBtn.append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("pointer-events", "none")
      .text("⟲");
    
    resetBtn.on("click", () => {
      svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    });
  }
  
  // Create a group for links with tooltips
  const linkGroup = g.append('g');
  
  // Create relationships (edges)
  const link = linkGroup.selectAll('line')
    .data(validLinks)
    .enter()
    .append('line')
    .attr('stroke-width', d => {
      // Modify the stroke width based on properties
      if (d.properties) {
        // Example: if the relationship has a 'weight' or 'rating' property
        if (d.properties.weight) {
          return 1 + Math.min(5, d.properties.weight);
        }
        if (d.properties.rating) {
          return 1 + Math.min(5, d.properties.rating);
        }
      }
      return 2;
    })
    .attr('data-type', d => d.type)
    .attr('stroke', d => relColors[d.type] || '#999999')
    .attr('stroke-dasharray', d => {
      // Use property to determine dash pattern if available
      if (d.properties && d.properties.pattern === 'dashed') {
        return '5,5';
      }
      if (d.properties && d.properties.pattern === 'dotted') {
        return '2,2';
      }
      return null;
    })
    .on('mouseover', function(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(createRelationshipTooltip(d))
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on('mouseout', function() {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
  
  // Create nodes with dynamic styling based on labels and properties
  const node = g.append('g')
    .selectAll('circle')
    .data(graphData.nodes)
    .enter()
    .append('circle')
    .attr('r', d => {
      // Base node size on specific properties if available
      if (d.properties.size) {
        return Math.max(10, Math.min(30, d.properties.size));
      }
      
      if (d.properties.importance) {
        return Math.max(10, Math.min(30, 10 + d.properties.importance * 5));
      }
      
      if (d.properties.runtime) {
        // For movies, size by runtime
        return Math.max(15, Math.min(25, 15 + d.properties.runtime / 30));
      }
      
      if (d.properties.born) {
        // For people, newer = larger
        const birthYear = new Date(d.properties.born).getFullYear();
        if (!isNaN(birthYear)) {
          return Math.max(10, Math.min(20, (birthYear - 1900) / 10));
        }
      }
      
      // Default: Base node size on property count
      const propCount = Object.keys(d.properties).length;
      return Math.max(15, Math.min(25, 15 + propCount / 3));
    })
    .attr('class', d => d.label.replace(/\s+/g, ' '))
    .style('fill', d => {
      // Get the first label for color
      const firstLabel = d.label.split(' ')[0];
      return labelColors[firstLabel] || '#999999';
    })
    .style('opacity', d => {
      // Use opacity to represent certain properties
      if (d.properties.rating) {
        return 0.5 + (d.properties.rating / 10) * 0.5;
      }
      return 1;
    })
    .on('mouseover', function(event, d) {
      // Show node details in tooltip
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(createNodeTooltip(d))
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on('mouseout', function() {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    })
    .call(drag(simulation));

  // Add property value indicators inside nodes if they have certain properties
  node.each(function(d) {
    const element = d3.select(this);
    
    // Add text property indicators inside the node if it has a special property
    if (d.properties.rating) {
      g.append("text")
        .attr("class", "node-value")
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .style("font-size", "10px")
        .style("fill", "white")
        .style("pointer-events", "none")
        .text(d.properties.rating)
        .datum(d); // Bind the same data for position updating
    }
    
    // Add movie year indicator if it's a movie with a year
    if (d.label.includes("Movie") && d.properties.released) {
      try {
        const year = new Date(d.properties.released).getFullYear();
        if (!isNaN(year)) {
          g.append("text")
            .attr("class", "node-value")
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .style("font-size", "9px")
            .style("fill", "white")
            .style("pointer-events", "none")
            .text(year)
            .datum(d); // Bind the same data for position updating
        }
      } catch (e) {
        // If date parsing fails, skip
      }
    }
  });

  // Add basic labels to nodes if there aren't too many
  if (graphData.nodes.length < 50) {
    const label = g.append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .enter()
      .append('text')
      .attr("class", "node-label")
      .text(d => {
        const labelProp = getBestLabelProperty(d.properties);
        if (labelProp.value) {
          // Truncate long labels
          const text = String(labelProp.value);
          return text.length > 20 ? text.substring(0, 17) + '...' : text;
        }
        return d.label;
      })
      .attr('dx', 20)
      .attr('dy', '.35em')
      .style('font-size', '12px')
      .style('pointer-events', 'none'); // Prevent text from interfering with dragging
      
    // Update label positions during simulation
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
        
      // Update node value indicators
      g.selectAll(".node-value")
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });
  } else {
    // If there are too many nodes, skip the labels to improve performance
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
        
      // Update node value indicators
      g.selectAll(".node-value")
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });
  }
  
  // Create dynamic legend based on node types
  if (isNewUI) {
    // For new UI, use the legend container in the DOM
    const legendContainer = document.getElementById('graph-legend');
    if (legendContainer) {
      legendContainer.innerHTML = '';
      
      if (nodeLabels.size > 0) {
        const legendHTML = document.createElement('div');
        legendHTML.innerHTML = '<h3 class="legend-title">Node Types</h3>';
        
        nodeLabels.forEach(label => {
          const legendItem = document.createElement('div');
          legendItem.className = 'legend-item';
          
          const colorSwatch = document.createElement('div');
          colorSwatch.className = 'legend-color';
          colorSwatch.style.backgroundColor = labelColors[label];
          
          const labelText = document.createElement('span');
          labelText.className = 'legend-label';
          labelText.textContent = label;
          
          legendItem.appendChild(colorSwatch);
          legendItem.appendChild(labelText);
          legendHTML.appendChild(legendItem);
        });
        
        // Only add relationship section if we have relationships
        if (relTypes.size > 0) {
          const relLegendHTML = document.createElement('div');
          relLegendHTML.innerHTML = '<h3 class="legend-title" style="margin-top: 16px;">Relationship Types</h3>';
          
          relTypes.forEach(type => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            const colorSwatch = document.createElement('div');
            colorSwatch.className = 'legend-color';
            colorSwatch.style.backgroundColor = relColors[type];
            colorSwatch.style.borderRadius = '0';
            colorSwatch.style.height = '3px';
            colorSwatch.style.width = '20px';
            
            const labelText = document.createElement('span');
            labelText.className = 'legend-label';
            labelText.textContent = type;
            
            legendItem.appendChild(colorSwatch);
            legendItem.appendChild(labelText);
            relLegendHTML.appendChild(legendItem);
          });
          
          legendHTML.appendChild(relLegendHTML);
        }
        
        legendContainer.appendChild(legendHTML);
      }
    }
    
    // Create property controls for new UI
    const propertyContainer = document.getElementById('property-controls');
    if (propertyContainer) {
      createPropertyControlsNewUI(graphData, nodeLabels, labelColors);
    }
  } else {
    // For legacy UI, use the D3 SVG for the legend
    if (nodeLabels.size <= 10) { // Only show legend if not too many types
      const legend = g.append('g')
        .attr('transform', 'translate(20, 20)');
      
      // Node types legend
      let yOffset = 0;
      nodeLabels.forEach(label => {
        // Add node type circle
        legend.append('circle')
          .attr('cx', 10)
          .attr('cy', yOffset + 10)
          .attr('r', 10)
          .style('fill', labelColors[label]);
        
        // Add node type text
        legend.append('text')
          .attr('x', 30)
          .attr('y', yOffset + 15)
          .text(label)
          .style('font-size', '12px');
          
        yOffset += 30;
      });
    }
    
    // Create dynamic legend for relationship types
    if (relTypes.size <= 10 && relTypes.size > 0) {
      const relLegend = g.append('g')
        .attr('transform', `translate(${Math.min(width - 200, Math.max(180, width/2))}, 20)`);
      
      let yOffset = 0;
      relTypes.forEach(type => {
        // Add relationship line
        relLegend.append('line')
          .attr('x1', 10)
          .attr('y1', yOffset + 10)
          .attr('x2', 50)
          .attr('y2', yOffset + 10)
          .attr('stroke', relColors[type])
          .attr('stroke-width', 2);
        
        // Add relationship text
        relLegend.append('text')
          .attr('x', 60)
          .attr('y', yOffset + 15)
          .text(type)
          .style('font-size', '12px');
          
        yOffset += 30;
      });
    }
    
    // Add instructions for zoom and pan
    const instructions = svg.append("text")
      .attr("x", width - 250)
      .attr("y", 30)
      .style("font-size", "12px")
      .style("fill", "#666")
      .text("Scroll to zoom, drag to pan");
    
    // Create property controls panel for legacy UI
    createPropertyControlsLegacy(g, graphData, nodeLabels, labelColors);
  }
}

// Create property controls panel for new UI
function createPropertyControlsNewUI(graphData, nodeLabels, labelColors) {
  // Collect all property keys from all nodes
  const propertySet = new Set();
  graphData.nodes.forEach(node => {
    Object.keys(node.properties).forEach(key => propertySet.add(key));
  });
  
  // Clear existing property controls
  const propertyContainer = document.getElementById('property-controls');
  propertyContainer.innerHTML = '';
  
  // Only show control panel if we have properties and not too many nodes
  if (propertySet.size > 0 && graphData.nodes.length < 200) {
    const properties = Array.from(propertySet);
    
    // Only show the most useful properties (limit to 5)
    const usefulProperties = ['rating', 'released', 'born', 'runtime', 'tagline']
      .filter(prop => properties.includes(prop))
      .slice(0, 5);
    
    if (usefulProperties.length > 0) {
      const controlsHTML = document.createElement('div');
      controlsHTML.innerHTML = '<h3>Highlight by Property:</h3>';
      
      usefulProperties.forEach((prop) => {
        const controlItem = document.createElement('div');
        controlItem.className = 'property-control-item';
        controlItem.style.margin = '8px 0';
        controlItem.style.display = 'flex';
        controlItem.style.justifyContent = 'space-between';
        controlItem.style.alignItems = 'center';
        
        const propLabel = document.createElement('span');
        propLabel.textContent = prop;
        
        const highlightBtn = document.createElement('button');
        highlightBtn.textContent = 'Highlight';
        highlightBtn.className = 'query-btn';
        highlightBtn.style.padding = '5px 10px';
        highlightBtn.style.width = 'auto';
        
        controlItem.appendChild(propLabel);
        controlItem.appendChild(highlightBtn);
        
        highlightBtn.addEventListener('click', () => {
          // Reset all nodes
          d3.selectAll('circle')
            .transition()
            .duration(300)
            .style('opacity', 0.3);
          
          // Highlight nodes with this property
          d3.selectAll('circle')
            .filter(d => d.properties[prop] !== undefined)
            .transition()
            .duration(300)
            .style('opacity', 1)
            .attr('r', d => {
              const val = parseFloat(d.properties[prop]);
              if (!isNaN(val)) {
                return Math.max(15, Math.min(35, 15 + val / 2));
              }
              return 20;
            });
          
          // Add reset button if it doesn't exist
          if (!document.getElementById('reset-highlight')) {
            const resetButton = document.createElement('button');
            resetButton.id = 'reset-highlight';
            resetButton.textContent = 'Reset Highlights';
            resetButton.className = 'query-btn';
            resetButton.style.width = '100%';
            resetButton.style.marginTop = '15px';
            resetButton.style.backgroundColor = '#ff5252';
            
            resetButton.addEventListener('click', () => {
              // Reset all nodes
              d3.selectAll('circle')
                .transition()
                .duration(300)
                .style('opacity', 1)
                .attr('r', d => {
                  const propCount = Object.keys(d.properties).length;
                  return Math.max(15, Math.min(25, 15 + propCount / 3));
                });
            });
            
            propertyContainer.appendChild(resetButton);
          }
        });
        
        controlsHTML.appendChild(controlItem);
      });
      
      propertyContainer.appendChild(controlsHTML);
    }
  }
}

// Create property controls panel for legacy UI
function createPropertyControlsLegacy(svg, graphData, nodeLabels, labelColors) {
  // Collect all property keys from all nodes
  const propertySet = new Set();
  graphData.nodes.forEach(node => {
    Object.keys(node.properties).forEach(key => propertySet.add(key));
  });
  
  // Only show control panel if we have properties and not too many nodes
  if (propertySet.size > 0 && graphData.nodes.length < 200) {
    const properties = Array.from(propertySet);
    
    // Only show the most useful properties (limit to 5)
    const usefulProperties = ['rating', 'released', 'born', 'runtime', 'tagline']
      .filter(prop => properties.includes(prop))
      .slice(0, 5);
    
    if (usefulProperties.length > 0) {
      const controlPanel = svg.append('g')
        .attr('transform', 'translate(20, 150)'); // Moved down to avoid overlap with zoom controls
      
      controlPanel.append('rect')
        .attr('x', -10)
        .attr('y', -20)
        .attr('width', 180)
        .attr('height', 30 + usefulProperties.length * 25)
        .attr('fill', 'rgba(255, 255, 255, 0.8)')
        .attr('stroke', '#ccc')
        .attr('rx', 5);
      
      controlPanel.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .text('Highlight by Property:')
        .style('font-weight', 'bold')
        .style('font-size', '12px');
      
      usefulProperties.forEach((prop, i) => {
        const y = 20 + i * 25;
        
        controlPanel.append('text')
          .attr('x', 0)
          .attr('y', y)
          .text(prop)
          .style('font-size', '12px');
        
        const button = controlPanel.append('rect')
          .attr('x', 80)
          .attr('y', y - 15)
          .attr('width', 60)
          .attr('height', 20)
          .attr('fill', '#f0f0f0')
          .attr('stroke', '#ccc')
          .attr('rx', 3)
          .style('cursor', 'pointer');
        
        controlPanel.append('text')
          .attr('x', 110)
          .attr('y', y)
          .text('Highlight')
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('pointer-events', 'none');
        
        button.on('click', () => {
          // Reset all nodes
          svg.selectAll('circle')
            .transition()
            .duration(300)
            .style('opacity', 0.3);
          
          // Highlight nodes with this property
          svg.selectAll('circle')
            .filter(d => d.properties[prop] !== undefined)
            .transition()
            .duration(300)
            .style('opacity', 1)
            .attr('r', d => {
              const val = parseFloat(d.properties[prop]);
              if (!isNaN(val)) {
                return Math.max(15, Math.min(35, 15 + val / 2));
              }
              return 20;
            });
          
          // Add reset button if it doesn't exist
          if (!controlPanel.select('.reset-button').size()) {
            const resetButton = controlPanel.append('rect')
              .attr('class', 'reset-button')
              .attr('x', 80)
              .attr('y', 20 + usefulProperties.length * 25)
              .attr('width', 60)
              .attr('height', 20)
              .attr('fill', '#ffd0d0')
              .attr('stroke', '#ccc')
              .attr('rx', 3)
              .style('cursor', 'pointer');
            
            controlPanel.append('text')
              .attr('x', 110)
              .attr('y', 40 + usefulProperties.length * 25)
              .text('Reset')
              .attr('text-anchor', 'middle')
              .style('font-size', '10px')
              .style('pointer-events', 'none');
            
            resetButton.on('click', () => {
              // Reset all nodes
              svg.selectAll('circle')
                .transition()
                .duration(300)
                .style('opacity', 1)
                .attr('r', d => {
                  const propCount = Object.keys(d.properties).length;
                  return Math.max(15, Math.min(25, 15 + propCount / 3));
                });
            });
            
            // Update panel background to include reset button
            controlPanel.select('rect').attr('height', 50 + usefulProperties.length * 25);
          }
        });
      });
    }
  }
}

// Handle node click-n-drag
function drag(simulation) {
  return d3.drag()
    .on('start', event => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    })
    .on('drag', event => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    })
    .on('end', event => {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    });
}