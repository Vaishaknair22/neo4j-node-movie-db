/* eslint-disable no-undef */
const express = require(`express`);
const neo4j = require(`neo4j-driver`);

const app = express();
const port = 3000;

// Enable CORS for debugging
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Connect to Neo4j
let driver, session;
try {
  driver = neo4j.driver(
    `bolt://localhost:7687`,
    neo4j.auth.basic(`neo4j`, `Ironman12345!`)
  );
  // Update with your Neo4j database name:
  session = driver.session({ database: `neo4j` });
  console.log("Successfully connected to Neo4j database");
} catch (error) {
  console.error("Failed to connect to Neo4j:", error);
}

app.use(express.static(`public`));

app.get(`/graph`, async (req, res) => {
  const query = req.query.cypher;
  
  if (!query) {
    return res.status(400).json({ error: "No Cypher query provided" });
  }

  console.log(`Executing query: ${query}`);
  
  if (!driver || !session) {
    return res.status(500).json({ 
      error: "Database connection not established",
      nodes: [],
      links: []
    });
  }

  try {
    // Execute the query
    const result = await session.run(query);
    const nodesMap = new Map();
    const links = [];

    console.log(`Query returned ${result.records.length} records`);

    // Process records from Neo4j
    result.records.forEach(record => {
      record.keys.forEach(key => {
        const value = record.get(key);
        
        // Skip nulls/undefined
        if (!value) return;
        
        // If it's a Node
        if (neo4j.isNode(value)) {
          processNode(value, nodesMap);
        }
        // If it's a Relationship
        else if (neo4j.isRelationship(value)) {
          processRelationship(value, links);
        }
        // If it's a Path
        else if (neo4j.isPath(value)) {
          processPath(value, nodesMap, links);
        }
        // If it's an array or collection
        else if (Array.isArray(value)) {
          value.forEach(item => {
            if (neo4j.isNode(item)) {
              processNode(item, nodesMap);
            } else if (neo4j.isRelationship(item)) {
              processRelationship(item, links);
            } else if (neo4j.isPath(item)) {
              processPath(item, nodesMap, links);
            }
          });
        }
        // If it's an object with Neo4j types
        else if (typeof value === 'object') {
          Object.values(value).forEach(prop => {
            if (neo4j.isNode(prop)) {
              processNode(prop, nodesMap);
            } else if (neo4j.isRelationship(prop)) {
              processRelationship(prop, links);
            } else if (neo4j.isPath(prop)) {
              processPath(prop, nodesMap, links);
            }
          });
        }
      });
    });

    // Special case handling for pattern queries
    if (query.includes('MATCH') && query.includes('RETURN') && links.length === 0) {
      // Check if we need to infer relationships between nodes
      inferRelationships(result, nodesMap, links);
    }

    // Extract and return nodes as an array
    const nodes = Array.from(nodesMap.values());
    
    console.log(`Returning ${nodes.length} nodes and ${links.length} relationships`);
    
    // Return the data
    res.json({ 
      nodes, 
      links,
      query: query  // Include original query for reference
    });
  } catch (error) {
    console.error(`Error executing query:`, error);
    res.status(500).json({ 
      error: `Database query error: ${error.message}`,
      nodes: [],
      links: []
    });
  }
});

// Helper function to process a Neo4j Node
function processNode(node, nodesMap) {
  const identity = node.identity.toString();
  if (!nodesMap.has(identity)) {
    nodesMap.set(identity, {
      id: identity,
      label: node.labels.join(` `),
      properties: node.properties
    });
  }
}

// Helper function to process a Neo4j Relationship
function processRelationship(rel, links) {
  links.push({
    source: rel.start.toString(),
    target: rel.end.toString(),
    type: rel.type,
    properties: rel.properties
  });
}

// Helper function to process a Neo4j Path
function processPath(path, nodesMap, links) {
  path.segments.forEach(segment => {
    processNode(segment.start, nodesMap);
    processNode(segment.end, nodesMap);
    processRelationship(segment.relationship, links);
  });
}

// Helper function to infer relationships from pattern queries
function inferRelationships(result, nodesMap, links) {
  // For each record
  result.records.forEach(record => {
    const recordNodes = [];
    const nodeKeys = record.keys.filter(key => {
      const value = record.get(key);
      return neo4j.isNode(value);
    });
    
    // Get all nodes in this record
    nodeKeys.forEach(key => {
      const node = record.get(key);
      recordNodes.push({
        key: key,
        node: node
      });
    });
    
    // If we have at least 2 nodes, we might have a relationship between them
    if (recordNodes.length >= 2) {
      // For simplicity, just connect each node to all others in this record
      // In a real app, you'd use the Cypher pattern to determine actual relationships
      for (let i = 0; i < recordNodes.length; i++) {
        for (let j = i + 1; j < recordNodes.length; j++) {
          const sourceNode = recordNodes[i].node;
          const targetNode = recordNodes[j].node;
          
          // Create an inferred relationship
          links.push({
            source: sourceNode.identity.toString(),
            target: targetNode.identity.toString(),
            type: 'RELATED_TO',
            inferred: true
          });
        }
      }
    }
  });
}

// Add a simple test endpoint
app.get('/test', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});