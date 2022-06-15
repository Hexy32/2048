import Grid from './grid.js'
import Tile from './tile.js'

const gameBoard = document.getElementById('game-board')
const pageTitle = document.getElementById('page-title')

const grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
setupInput()

function setupInput() {
  window.addEventListener('keydown', handleInput, { once: true })
}

async function handleInput(e) {
  switch (e.key) {
    case 'ArrowUp':
      if (!canMoveUp()) {
        setupInput()
        return
      }
      await moveUp()
      break
    case 'ArrowDown':
      if (!canMoveDown()) {
        setupInput()
        return
      }
      await moveDown()
      break
    case 'ArrowLeft':
      if (!canMoveLeft()) {
        setupInput()
        return
      }
      await moveLeft()
      break
    case 'ArrowRight':
      if (!canMoveRight()) {
        setupInput()
        return
      }
      await moveRight()
      break
    default:
      await setupInput()
      return
  }

  grid.cells.forEach((cell) => cell.mergeTiles())

  const newTile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = newTile

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      alert(`Game Over! You got a score of ${countTiles()}`)
    })
    return
  }

  updateScore()
  setupInput()
}

function updateScore() {
  pageTitle.innerText = `2048 | Current Score: ${countTiles()}`
}

function countTiles() {
  let x = 0
  grid.cells.forEach((cell) => {
    if (!cell.tile) return
    x += cell.tile.value
  })
  return x
}

function moveUp() {
  return slideTile(grid.cellsByColumn)
}

function moveDown() {
  return slideTile(grid.cellsByColumn.map((column) => [...column].reverse()))
}

function moveLeft() {
  return slideTile(grid.cellsByRow)
}

function moveRight() {
  return slideTile(grid.cellsByRow.map((column) => [...column].reverse()))
}

function slideTile(cells) {
  return Promise.all(
    cells.flatMap((group) => {
      const promises = []
      for (let i = 0; i < group.length; i++) {
        const cell = group[i]
        if (cell.tile == null) continue
        let lastValidCell
        for (let j = i - 1; j >= 0; j--) {
          const moveToCell = group[j]
          if (!moveToCell.canAccept(cell.tile)) break
          lastValidCell = moveToCell
        }

        if (lastValidCell != null) {
          promises.push(cell.tile.waitForTransition())
          if (lastValidCell.tile != null) {
            lastValidCell.mergeTile = cell.tile
          } else {
            lastValidCell.tile = cell.tile
          }
          cell.tile = null
        }
      }
      return promises
    })
  )
}

function canMoveUp() {
  return canMove(grid.cellsByColumn)
}

function canMoveDown() {
  return canMove(grid.cellsByColumn.map((column) => [...column].reverse()))
}

function canMoveLeft() {
  return canMove(grid.cellsByRow)
}

function canMoveRight() {
  return canMove(grid.cellsByRow.map((column) => [...column].reverse()))
}

function canMove(cells) {
  return cells.some((group) => {
    return group.some((cell, index) => {
      if (index == 0) return false
      if (cell.tile == null) return false
      const moveToCell = group[index - 1]
      return moveToCell.canAccept(cell.tile)
    })
  })
}
