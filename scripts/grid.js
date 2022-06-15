let GRID_SIZE = 4

export default class Grid {
  #cells

  constructor(gridElement, size = 4) {
    if (size < 2) {
      size = 2
    }

    if (size > 10) {
      size = 10
    }

    const cellSize = Math.round(65 / size)
    const cellGap = Math.round(cellSize / 6)

    GRID_SIZE = size

    gridElement.style.setProperty('--grid-size', size)
    gridElement.style.setProperty('--cell-size', `${cellSize}vmin`)
    gridElement.style.setProperty('--cell-gap', `${cellGap}vmin`)

    this.#cells = createCellElements(gridElement).map((valueOfArray, index) => {
      return new Cell(
        valueOfArray,
        index % GRID_SIZE,
        Math.floor(index / GRID_SIZE)
      )
    })
  }

  get cells() {
    return this.#cells
  }

  get cellsByColumn() {
    return this.#cells.reduce((cellGrid, cell) => {
      cellGrid[cell.x] = cellGrid[cell.x] || []
      cellGrid[cell.x][cell.y] = cell
      return cellGrid
    }, [])
  }

  get cellsByRow() {
    return this.#cells.reduce((cellGrid, cell) => {
      cellGrid[cell.y] = cellGrid[cell.y] || []
      cellGrid[cell.y][cell.x] = cell
      return cellGrid
    }, [])
  }

  get #emptyCells() {
    return this.#cells.filter((cell) => cell.tile == null)
  }

  randomEmptyCell() {
    const randomIndex = Math.floor(Math.random() * this.#emptyCells.length)
    return this.#emptyCells[randomIndex]
  }

  remove() {
    this.#cells.forEach((cell) => cell.remove())
  }
}

class Cell {
  #cellElement
  #x
  #y
  #tile
  #mergeTile

  constructor(cellElement, x, y) {
    this.#cellElement = cellElement
    this.#x = x
    this.#y = y
  }

  get x() {
    return this.#x
  }

  get y() {
    return this.#y
  }

  get tile() {
    return this.#tile
  }

  set tile(value) {
    this.#tile = value
    if (value == null) return
    this.#tile.x = this.#x
    this.#tile.y = this.#y
  }

  get mergeTile() {
    return this.#mergeTile
  }

  set mergeTile(value) {
    this.#mergeTile = value
    if (value == null) return
    this.#mergeTile.x = this.#x
    this.#mergeTile.y = this.#y
  }

  canAccept(tile) {
    return (
      this.tile == null ||
      (this.mergeTile == null && this.tile.value === tile.value)
    )
  }

  mergeTiles() {
    if (this.mergeTile == null || this.tile == null) return
    this.tile.value = this.mergeTile.value * 2
    this.mergeTile.remove()
    this.mergeTile = null
  }

  remove() {
    this.#cellElement.remove()
  }
}

function createCellElements(gridElement) {
  const cells = []
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const cell = document.createElement('div')
    cell.classList.add('cell')
    gridElement.appendChild(cell)
    cells.push(cell)
  }
  return cells
}
