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

// TODO: WorkerPool, PageState, MandelbrotCanvas
