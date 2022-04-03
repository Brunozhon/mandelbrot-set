class Tile {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  static *tiles(width, height, numRows, numCols) {
    let columnWidth = Math.ceil(width / numCols);
    let rowHeight = Math.ceil(height / numRows);
    
    for (let row = 0; row < numRows; row++) {
      let tileHeight = (row < numRows - 1) ? rowHeight : height - rowHeight * (numRows - 1);
      for (let col = 0; col < numCols; col++) {
        let tileWidth = (col < numCols - 1) ? columnWidth : width - columnWidth * (numCols - 1);
        yield new Tile(col * columnWidth, row * rowHeight, tileWidth, tileHeight);
      }
    }
  }
}

class WorkerPool {
  constructor(numWorkers, workerSource) {
    this.idleWorkers = [];
    this.workQueue = [];
    this.workerMap = new Map();
    
    for (let i = 0; i < numWorkers; i++) {
      let worker = new Worker(workerSource);
      worker.onmessage = message => {
        this._workerDone(worker, null, message.data);
      }
      worker.onerror = error => {
        this._workerDone(worker, error, null);
      }
    }
  }
  
  _workerDone(worker, error, response) {
    let [resolver, rejector] = this.workerMap.get(worker);
    this.workerMap.delete(worker);
    if (this.workQueue.length === 0) {
      this.idleWorkers.push(worker);
    } else {
      let [work, resolver, rejector] = this.workQueue.shift();
      this.workerMap.set(worker, [resolver, rejector]);
      worker.postMessage(work);
    }
    
    error === null ? resolver(response) : rejector(error);
  }
  
  addWork(work) {
    return new Promise((resolve, reject) => {
      if (this.idleWorkers.length > 0) {
        let worker = this.idleWorkers.pop()
        this.workerMap.set(worker, [resolve, reject]);
        worker.postMessage(work);
      } else {
        this.workQueue.push([work, resolve, reject]);
      }
    });
  }
}

class PageState {
  static initialState() {
    let s = new PageState();
    s.cx = -0.5;
    s.cy = 0;
    s.perPixel = 3 / window.innerHeight;
    s.maxIterations = 500;
    return s;
  }
  
  static fromURL(url) {
    let s = new PageState();
    let u = new URL(url);
    s.cx = parseFloat(u.searchParams.get("cx"))
    s.cy = parseFloat(u.searchParams.get("cy"))
    s.perPixel = parseFloat(u.searchParams.get("pp"))
    s.maxIterations = parseInt(u.searchParams.get("it"))
    return (isNaN(s.cx) || isNaN(s.cy) || isNaN(s.perPixel) || isNaN(s.maxIterations)) ? null : s;
  }
  
  toURL() {
    let u = new URL(window.location);
    u.searchParams.set("cx", this.cx);
    u.searchParams.set("cy", this.cy);
    u.searchParams.set("pp", this.perPixel);
    u.searchParams.set("it", this.maxIterations);
    return u.href;
  }
}

// TODO: MandelbrotCanvas
