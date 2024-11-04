const { MinHeap: MinHeapImpl } = require('@datastructures-js/heap');

class MinHeap {
    constructor() {
        this.minHeap = new MinHeapImpl((document) => document.score);
    }

    insert(document) {
        this.minHeap.insert(document);
    }

    size() {
        return this.minHeap.size();
    }

    pop() {
        return this.minHeap.pop();
    }
}

module.exports = MinHeap;