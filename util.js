const DIRS = {
    N: 1,
    S: 2,
    E: 4,
    W: 8,
    1: "north",
    2: "south",
    4: "east",
    8: "west"
}
const Direction = {
    N: 1 << 0,
    S: 1 << 1,
    E: 1 << 2,
    W: 1 << 3,
    dx: { 1: 0, 2: 0, 4: 1, 8: -1 },
    dy: { 1: -1, 2: 1, 4: 0, 8: 0 },
    opposite: { 1: 2, 2: 1, 4: 8, 8: 4 },
    dirs: {1: "north", 2: "south", 4: "east", 8: "west"}
}

const setImmediateAnalogues = [
    cb => cb(),

    cb => setTimeout(cb, 1),

    requestAnimationFrame,

    cb => requestIdleCallback(cb, { timeout: 5 }),

    cb => {
        window.onmessage = event => {
            if (event.source === window) cb()
        }
        window.postMessage('', window.location)
    },

    cb => {
        const { port1, port2 } = new MessageChannel()
        port2.onmessage = cb
        port1.postMessage('')
    },
];

function shuffle(array, start, end) {
    var m = end - start;
    while (m) {
      var i = Math.floor(Math.random() * m--);
      var tmp = array[start + m];
      array[start + m] = array[start + i];
      array[start + i] = tmp;
    }
}

function shuffleArray(array) {
    array.sort(() => Math.random() - 0.5);
}

function markCell(x, y, classname) {
    var cell = document.getElementById(`${y}-${x}`)
    cell.classList.add(classname)
}

function markLine(x, y, classname) {
    var cell = document.getElementById(`${y}-${x}`)
    cell.className = cell.className + ` ${classname}`
}

function unmarkCell(x, y, classname) {
    var cell = document.getElementById(`${y}-${x}`)
    cell.classList.remove(classname)
}

function toggleCellClass(id, classname) {
    var cell = document.getElementById(id)
    cell.classList.toggle(classname)
}

function randomPop(arr, index) {
    // maintains order of the arr
    if(!arr || arr.length == 0) return
    const i = index == null ? Math.floor(Math.random() * arr.length) : index
    const subarr = arr.splice(i, 1)
    if(subarr.length == 1) return subarr[0]
    return
}

function swapAndPop(arr, index) {
    // order of arr gets a hit because of swap
    if(!arr || arr.length == 0) return
    const i = index == null ? Math.floor(Math.random() * arr.length) : index
    const temp = arr[i]
    arr[i] = arr[arr.length - 1]
    arr[arr.length - 1] = temp
    return arr.pop()
}

function randIntBetween(x, y) {
    return x + 1 + Math.floor(Math.random() * (y - x))
}

const timer = ms => new Promise(res => setTimeout(res, ms))

const randBinaryInt = () => Math.floor(Math.random() * 2)

const randInt = (n) => Math.floor(Math.random() * n)

const randIntWithProbability = (freqArr) => {
    const prefixArr = freqArr.map((acc => val => acc += val)(0))
    const randnum = randInt(prefixArr[freqArr.length-1]) + 1
    for(let i = 0; i < freqArr.length; i++) {
        if(randnum <= prefixArr[i]) return i
    }
    return -1
}

const getElement = (idOrElement) => {
    var elem = idOrElement
    if(typeof idOrElement === 'string') 
        elem = document.getElementById(idOrElement)
    else if(idOrElement.hasOwnProperty('x'))
        elem = document.getElementById(`${idOrElement.y}-${idOrElement.x}`)
    return elem
}

const markClass = (idOrElement, classname, removeClassname) => {
    var elem = getElement(idOrElement)
    if(removeClassname)
        elem.classList.replace(removeClassname, classname)
    else
        elem.classList.add(classname)
}

const unmarkClass = (idOrElement, removeClassname) => {
    var elem = getElement(idOrElement)
    elem.classList.remove(removeClassname)
}

const hasClass = (idOrElement, classname) => {
    var elem = getElement(idOrElement)
    return elem.classList.contains(classname)
}

const hasAnyClass = (idOrElement, classnames) => {
    var cl = getElement(idOrElement).classList
    const classes = classnames.split(" ")
    for(const classname of classes) {
        if(cl.contains(classname)) return true
    }
    return false
}

const hasAllClasses = (idOrElement, classnames) => {
    var cl = getElement(idOrElement).classList
    const classes = classnames.split(" ")
    for(const classname of classes) {
        if(!cl.contains(classname)) return false
    }
    return true
}

const resetLineGrid = (height, width, connected) => {
    var classes = 'cell'
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            const cellObj = document.getElementById(`${y}-${x}`)
            if(hasClass(cellObj, 'start')) classes += ' start'
            if(hasClass(cellObj, 'end')) classes += ' end'
            cellObj.className = connected ? classes : classes + " north south east west"
        }
    }
}

const getDir = (fromCellId, toCellId) => {
    const [y1, x1] = fromCellId.split("-").map(i => parseInt(i))
    const [y2, x2] = toCellId.split("-").map(i => parseInt(i))
    if(x1 > x2) return Direction.W
    if(x1 < x2) return Direction.E
    if(y1 > y2) return Direction.N
    if(y1 < y2) return Direction.S
}

const mergeCells = (fromCellId, toCellId) => {
    if(!fromCellId || !toCellId) return
    const dir = getDir(fromCellId, toCellId)
    unmarkClass(fromCellId, Direction.dirs[dir])
    unmarkClass(toCellId, Direction.dirs[Direction.opposite[dir]])
}

const isVisitedInLinedMaze = (cellId) => {
    return !hasAllClasses(cellId, "north south east west")
}