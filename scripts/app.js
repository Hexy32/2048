import Grid from './grid.js'
import Tile from './tile.js'

const gameBoard = document.getElementById('game-board')
const pageTitle = document.getElementById('page-title')
const gridRows = document.getElementById('grid-rows')
const endCard = document.getElementById('end-card')

let grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
setupInput()

setInputWidth()
console.log(grid)

function setInputWidth() {
  let gameBoardWidth = window.getComputedStyle(gameBoard).width
  let gameBoardPadding = window.getComputedStyle(gameBoard).paddingInline

  gridRows.style.marginInline = gameBoardPadding
  gridRows.style.width =
    gameBoardWidth.slice(0, -2) - gameBoardPadding.slice(0, -2) * 2 + 'px'
}

window.addEventListener('resize', () => {
  setInputWidth()
})

gridRows.addEventListener('keydown', (e) => {
  if (
    e.key === 'ArrowLeft' ||
    e.key === 'ArrowRight' ||
    e.key === 'ArrowUp' ||
    e.key === 'ArrowDown'
  ) {
    e.preventDefault()
  } else {
    updateGridSize()
  }
})

endCard.lastElementChild.addEventListener('click', () => {
  restartGame()
  console.log('restart')
})

gridRows.addEventListener('keyup', (e) => {
  if (
    e.key === 'ArrowLeft' ||
    e.key === 'ArrowRight' ||
    e.key === 'ArrowUp' ||
    e.key === 'ArrowDown'
  ) {
    return
  } else {
    updateGridSize()
  }
})

function updateGridSize() {
  grid.cells.forEach((cell) => {
    if (cell.tile != null) {
      cell.tile.remove()
    }
  })

  grid.remove()
  grid = null
  grid = new Grid(gameBoard, gridRows.value)

  setupInput()

  grid.randomEmptyCell().tile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = new Tile(gameBoard)

  setTimeout(setInputWidth(), 700)
}

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
      endCard.style.display = 'flex'
      endCard.children[0].innerText =
        getHighestTile() >= 2048 ? `You won!` : `You lost!`
      endCard.children[1].innerText = `Your score: ${countTiles()} |  Your highest tile: ${getHighestTile()}`
    })
    return
  }

  hideInput()
  updateScore()
  setupInput()
}

function restartGame() {
  endCard.style.display = 'none'
  updateGridSize()
  showInput()
}

function hideInput() {
  if (gridRows.style.opacity == '0') return
  gridRows.style.width = '0px'
  gridRows.style.opacity = '0'

  const height = window.getComputedStyle(gridRows).height.slice(0, -2)
  gameBoard.style.transition = '100ms cubic-bezier(0, 0.2, 1, 0.8)'
  gameBoard.style.transform = `translateY(-${height - height / 2}px)`
}

function showInput() {
  gridRows.style.width = 'auto'
  gridRows.style.opacity = '1'
  gameBoard.style.transform = `translateY(0px)`
  setInputWidth()
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

function getHighestTile() {
  let x = 0
  grid.cells.forEach((cell) => {
    if (!cell.tile) return
    if (x < cell.tile.value) x = cell.tile.value
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
