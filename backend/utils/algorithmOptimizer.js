// Algorithm Optimizer - O(log n) and O(1) optimized algorithms
class AlgorithmOptimizer {
  constructor() {
    this.sortedArrays = new Map(); // For binary search operations
    this.bloomFilters = new Map(); // For fast existence checks
    this.trie = new TrieNode(); // For autocomplete
  }

  // O(log n) - Binary search for sorted arrays
  binarySearch(arr, target, compareFn = (a, b) => a - b) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = compareFn(arr[mid], target);

      if (comparison === 0) {
        return mid;
      } else if (comparison < 0) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return -1; // Not found
  }

  // O(log n) - Find insertion point for maintaining sorted order
  findInsertionPoint(arr, item, compareFn = (a, b) => a - b) {
    let left = 0;
    let right = arr.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (compareFn(arr[mid], item) < 0) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return left;
  }

  // O(n log n) - Optimized merge sort for large datasets
  mergeSort(arr, compareFn = (a, b) => a - b) {
    if (arr.length <= 1) {return arr;}

    const merge = (left, right) => {
      const result = [];
      let i = 0, j = 0;

      while (i < left.length && j < right.length) {
        if (compareFn(left[i], right[j]) <= 0) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }
      }

      return result.concat(left.slice(i)).concat(right.slice(j));
    };

    const mid = Math.floor(arr.length / 2);
    const left = this.mergeSort(arr.slice(0, mid), compareFn);
    const right = this.mergeSort(arr.slice(mid), compareFn);

    return merge(left, right);
  }

  // O(n) - Quick select for finding kth element
  quickSelect(arr, k, compareFn = (a, b) => a - b) {
    if (arr.length === 1) {return arr[0];}

    const pivot = arr[Math.floor(Math.random() * arr.length)];
    const left = arr.filter(x => compareFn(x, pivot) < 0);
    const middle = arr.filter(x => compareFn(x, pivot) === 0);
    const right = arr.filter(x => compareFn(x, pivot) > 0);

    if (k < left.length) {
      return this.quickSelect(left, k, compareFn);
    } else if (k < left.length + middle.length) {
      return middle[0];
    }
    return this.quickSelect(right, k - left.length - middle.length, compareFn);

  }

  // O(1) average - Hash table for fast lookups
  createHashTable(items, keyFn = x => x.id) {
    const hashTable = new Map();
    items.forEach(item => {
      const key = keyFn(item);
      if (hashTable.has(key)) {
        // Handle collisions with chaining
        const existing = hashTable.get(key);
        if (Array.isArray(existing)) {
          existing.push(item);
        } else {
          hashTable.set(key, [existing, item]);
        }
      } else {
        hashTable.set(key, item);
      }
    });
    return hashTable;
  }

  // O(1) - Bloom filter for fast existence checks
  createBloomFilter(items, falsePositiveRate = 0.01) {
    const m = Math.ceil(-items.length * Math.log(falsePositiveRate) / (Math.log(2) ** 2));
    const k = Math.ceil(m / items.length * Math.log(2));
    const bitArray = new Array(m).fill(false);

    const hash1 = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash) % m;
    };

    const hash2 = (str) => {
      let hash = 5381;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i);
      }
      return Math.abs(hash) % m;
    };

    const add = (item) => {
      const str = typeof item === 'string' ? item : JSON.stringify(item);
      for (let i = 0; i < k; i++) {
        const index = (hash1(str) + i * hash2(str)) % m;
        bitArray[index] = true;
      }
    };

    const contains = (item) => {
      const str = typeof item === 'string' ? item : JSON.stringify(item);
      for (let i = 0; i < k; i++) {
        const index = (hash1(str) + i * hash2(str)) % m;
        if (!bitArray[index]) {return false;}
      }
      return true;
    };

    // Add all items to the filter
    items.forEach(add);

    return { add, contains, size: m, hashFunctions: k };
  }

  // O(m) - Trie for autocomplete functionality
  buildTrie(words) {
    const trie = new TrieNode();

    words.forEach(word => {
      let current = trie;
      for (const char of word.toLowerCase()) {
        if (!current.children.has(char)) {
          current.children.set(char, new TrieNode());
        }
        current = current.children.get(char);
      }
      current.isEndOfWord = true;
      current.word = word;
    });

    return trie;
  }

  // O(m + n) - Autocomplete search using trie
  autocomplete(trie, prefix, maxResults = 10) {
    const results = [];
    let current = trie;

    // Navigate to prefix
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) {
        return results;
      }
      current = current.children.get(char);
    }

    // DFS to find all words with prefix
    const dfs = (node) => {
      if (results.length >= maxResults) {return;}

      if (node.isEndOfWord) {
        results.push(node.word);
      }

      for (const child of node.children.values()) {
        dfs(child);
      }
    };

    dfs(current);
    return results;
  }

  // O(n) - Sliding window maximum
  slidingWindowMaximum(arr, windowSize) {
    const result = [];
    const deque = []; // Store indices

    for (let i = 0; i < arr.length; i++) {
      // Remove indices outside current window
      while (deque.length > 0 && deque[0] <= i - windowSize) {
        deque.shift();
      }

      // Remove indices of smaller elements
      while (deque.length > 0 && arr[deque[deque.length - 1]] <= arr[i]) {
        deque.pop();
      }

      deque.push(i);

      // Add maximum to result when window is complete
      if (i >= windowSize - 1) {
        result.push(arr[deque[0]]);
      }
    }

    return result;
  }

  // O(n) - Two pointers technique for sorted array problems
  twoSum(sortedArr, target) {
    let left = 0;
    let right = sortedArr.length - 1;

    while (left < right) {
      const sum = sortedArr[left] + sortedArr[right];
      if (sum === target) {
        return [left, right];
      } else if (sum < target) {
        left++;
      } else {
        right--;
      }
    }

    return [-1, -1];
  }

  // O(n) - Kadane's algorithm for maximum subarray
  maxSubarraySum(arr) {
    let maxSoFar = arr[0];
    let maxEndingHere = arr[0];

    for (let i = 1; i < arr.length; i++) {
      maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
      maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }

    return maxSoFar;
  }

  // O(n) - Boyer-Moore majority element
  findMajorityElement(arr) {
    let candidate = null;
    let count = 0;

    // Phase 1: Find candidate
    for (const num of arr) {
      if (count === 0) {
        candidate = num;
        count = 1;
      } else if (num === candidate) {
        count++;
      } else {
        count--;
      }
    }

    // Phase 2: Verify candidate
    count = 0;
    for (const num of arr) {
      if (num === candidate) {count++;}
    }

    return count > arr.length / 2 ? candidate : null;
  }

  // O(n) - Union-Find for connected components
  createUnionFind(size) {
    const parent = Array.from({ length: size }, (_, i) => i);
    const rank = new Array(size).fill(0);

    const find = (x) => {
      if (parent[x] !== x) {
        parent[x] = find(parent[x]); // Path compression
      }
      return parent[x];
    };

    const union = (x, y) => {
      const rootX = find(x);
      const rootY = find(y);

      if (rootX !== rootY) {
        // Union by rank
        if (rank[rootX] < rank[rootY]) {
          parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
          parent[rootY] = rootX;
        } else {
          parent[rootY] = rootX;
          rank[rootX]++;
        }
        return true;
      }
      return false;
    };

    const connected = (x, y) => find(x) === find(y);

    return { find, union, connected };
  }

  // O(V + E) - Topological sort using DFS
  topologicalSort(graph) {
    const visited = new Set();
    const stack = [];

    const dfs = (node) => {
      visited.add(node);

      for (const neighbor of graph[node] || []) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      }

      stack.push(node);
    };

    for (const node in graph) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return stack.reverse();
  }

  // O(n) - Reservoir sampling for random sampling
  reservoirSample(stream, k) {
    const reservoir = [];
    let i = 0;

    for (const item of stream) {
      if (i < k) {
        reservoir.push(item);
      } else {
        const j = Math.floor(Math.random() * (i + 1));
        if (j < k) {
          reservoir[j] = item;
        }
      }
      i++;
    }

    return reservoir;
  }

  // O(1) - LRU Cache implementation
  createLRUCache(capacity) {
    const cache = new Map();

    const get = (key) => {
      if (cache.has(key)) {
        const value = cache.get(key);
        cache.delete(key);
        cache.set(key, value); // Move to end
        return value;
      }
      return -1;
    };

    const put = (key, value) => {
      if (cache.has(key)) {
        cache.delete(key);
      } else if (cache.size >= capacity) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    };

    return { get, put, size: () => cache.size };
  }
}

// Trie Node class
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.word = null;
  }
}

module.exports = new AlgorithmOptimizer();
