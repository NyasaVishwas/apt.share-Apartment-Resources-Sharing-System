/**
 * DSA Helper: Graph BFS Traversal for Recommendation Engine
 * Recommends items from categories closely related in the category affinity graph.
 */
class CategoryAffinityGraph {
  constructor() {
    this.adjacencyList = new Map();
    this._initializeDefaultAffinityGraph();
  }

  _initializeDefaultAffinityGraph() {
    // Category co-borrow affinity edges
    this.addEdge('tools_diy', 'cleaning_equipment');
    this.addEdge('tools_diy', 'furniture');
    this.addEdge('outdoor_camping', 'electronics_camera');
    this.addEdge('party_events', 'kitchen_appliances');
    this.addEdge('party_events', 'electronics_camera');
    this.addEdge('baby_kids', 'furniture');
    this.addEdge('sports_fitness', 'outdoor_camping');
  }

  addCategory(category) {
    if (!this.adjacencyList.has(category)) {
      this.adjacencyList.set(category, new Set());
    }
  }

  addEdge(cat1, cat2) {
    this.addCategory(cat1);
    this.addCategory(cat2);
    this.adjacencyList.get(cat1).add(cat2);
    this.adjacencyList.get(cat2).add(cat1);
  }

  getRelatedCategoriesBFS(startCategory, maxDepth = 2) {
    if (!this.adjacencyList.has(startCategory)) {
      return [startCategory];
    }

    const visited = new Set();
    const queue = [{ category: startCategory, depth: 0 }];
    const related = [];

    visited.add(startCategory);

    while (queue.length > 0) {
      const { category, depth } = queue.shift();
      related.push(category);

      if (depth < maxDepth) {
        const neighbors = this.adjacencyList.get(category) || new Set();
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push({ category: neighbor, depth: depth + 1 });
          }
        }
      }
    }

    return related;
  }
}

module.exports = CategoryAffinityGraph;
