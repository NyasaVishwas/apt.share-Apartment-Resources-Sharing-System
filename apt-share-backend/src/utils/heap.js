/**
 * DSA Helper: Max-Heap Implementation
 * Used for computing top contributors (leaderboard) and trending items.
 */
class MaxHeap {
  constructor() {
    this.heap = [];
  }

  insert(element, score) {
    const node = { element, score };
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  extractMax() {
    if (this.isEmpty()) return null;
    const max = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._sinkDown(0);
    }
    return max.element;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }

  _bubbleUp(index) {
    const node = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];
      if (node.score <= parent.score) break;
      this.heap[index] = parent;
      index = parentIndex;
    }
    this.heap[index] = node;
  }

  _sinkDown(index) {
    const length = this.heap.length;
    const node = this.heap[index];
    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let swapIndex = null;

      if (leftChildIndex < length) {
        if (this.heap[leftChildIndex].score > node.score) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        const compareScore = swapIndex === null ? node.score : this.heap[leftChildIndex].score;
        if (this.heap[rightChildIndex].score > compareScore) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === null) break;
      this.heap[index] = this.heap[swapIndex];
      index = swapIndex;
    }
    this.heap[index] = node;
  }
}

module.exports = MaxHeap;
