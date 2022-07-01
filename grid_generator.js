
class Maze {
    constructor(height, width, algorithm, options) {
        this.grid = new Grid(height, width);
    }

    create() {
        const gridContainer = document.querySelector(".grid")
        const classname = "cell"
        var gridHTML = "<table>"
        this.grid.data.map((row, y) => {
            gridHTML += `<tr id="r${y}">`
            row.map((cellData, x) => {
                gridHTML += `<td id="${y}-${x}" class="${classname}"></td>`
            })
            gridHTML += `</tr>`
        })
        gridHTML += "</table>"
        gridContainer.innerHTML = gridHTML

    }
}

class Grid {
    constructor(height, width) {
        this.data = Array(height).fill().map((_,i) => Array(width).fill().map((_,j) => 0)); // Math.floor(16 * Math.random())
        this.edges = [];
    }
    at(x, y) {
        return this.data[y][x];
    }

    mark(x, y, dir) {
        this.data[y][x] |= dir;
    }

    clear(x, y, dir) {
        this.data[y][x] &= ~dir;
    }

    isMarked(x, y, dir) {
        return (this.data[y][x] & dir) === dir;
    }

    connect(x1, y1, x2, y2, dir) {
        this.mark(x1, y1, dir);
        this.mark(x2, y2, Direction.opposite[dir])
    }
    neighbours(x, y) {
        return [1,2,4,8]
            .filter(dir => this.isMarked(x, y, dir))
            .map(dir => [x + Direction.dx[dir], y + Direction.dy[dir]])
    }
}


const MazeGenerator = (mazeAlgo, height, width, options) => {
    const algos = {
        "recursive_division_block": RecursiveDivision,
        "recursive_division_line" : RecursiveDivisionLine,
        "kruskals_line": KruskalsMazeLine,
        "recursive_backtracker_line": RecursiveBacktrackerLine,
        "prims_line": PrimsMazeLine,
        "sidewinder_line": SidewinderLine,
        "binarytree_line": BinaryTreeLine,
        "growingtree_line": GrowingTreeLine,
    }
    const algo = algos[mazeAlgo]
    if(algo) return algo(height, width, options)
    console.log(`${mazeAlgo} not found :-(`)
}


function* RecursiveDivision(height, width, options) {
    console.log("in RecursiveDivision2")
    var stime = Date.now()
    var stack = []
    stack.push({x1: 0, y1: 0, x2: width-1, y2: height-1})
    console.log(height, width)
    while(stack.length > 0) {
        const {x1, y1, x2, y2} = stack.pop()

        const isHorzWall = wallOrientation(y2-y1, x2-x1) === "Horizontal"
        const wall = isHorzWall ? randIntBetween(y1+1, y2-1) : randIntBetween(x1+1, x2-1)
        const hole = isHorzWall ? randIntBetween(x1, x2) : randIntBetween(y1, y2)
        if(isHorzWall) {
            for(var x = x1; x <= x2; x++) {
                if(x != hole) {
                    markClass(`${wall}-${x}`, "maze-blocked")
                    yield 
                }
            }
            if(y2 - wall - 1 > 3)
                stack.push({x1: x1, y1: wall+1, x2: x2, y2: y2})
            if(wall - 1 - y1 > 3)
                stack.push({x1: x1, y1: y1, x2: x2, y2: wall-1})
        } 
        else {
            for(var y = y1; y <= y2; y++) {
                if(y != hole) markClass(`${y}-${wall}`, "maze-blocked")
                yield
            }
            if(x2 - wall - 1 > 3)
                stack.push({x1: wall+1, y1: y1, x2: x2, y2: y2})
            if(wall - 1 - x1 > 3) 
                stack.push({x1: x1, y1: y1, x2: wall-1, y2: y2})
        } 
    }
    console.log("Done!!!")
    yield { message: "success", timeTaken: Date.now() - stime }
}


function* RecursiveDivisionLine(height, width, options) {
    console.log("in RecursiveDivisionLine2")
    var stime = Date.now()
    var stack = []
    stack.push({x1: 0, y1: 0, x2: width-1, y2: height-1})

    while(stack.length > 0) {
        const {x1, y1, x2, y2} = stack.pop()

        const isHorzWall = randIntWithProbability([6,6])
        const wall = isHorzWall ? randIntBetween(y1, y2) : randIntBetween(x1, x2)
        const hole = isHorzWall ? randIntBetween(x1, x2) : randIntBetween(y1, y2)
        if(isHorzWall == 1) {
            for(var x = x1-1 > 0 ? x1-1: 0; x <= x2; x++) {
                if(x != hole && wall > 0) {
                    markLine(x, wall, "north")
                    markLine(x, wall-1, "south")
                    yield
                }
            }
            if(y2 - wall - 1 > 0)
                stack.push({x1: x1, y1: wall+1, x2: x2, y2: y2})
            if(wall - 1 - y1 > 0)
                stack.push({x1: x1, y1: y1, x2: x2, y2: wall-1})
        } 
        else {
            for(var y = y1-1 > 0 ? y1-1: 0; y <= y2; y++) {
                if(y != hole  && wall > 0) {
                    markLine(wall, y, "west")
                    markLine(wall-1, y, "east")
                    yield
                }
            }
            if(x2 - wall - 1 > 0)
                stack.push({x1: wall+1, y1: y1, x2: x2, y2: y2})
            if(wall - 1 - x1 > 0) 
                stack.push({x1: x1, y1: y1, x2: wall-1, y2: y2})
        } 
    }
    console.log("Done!!!")
    yield { message: "success", timeTaken: Date.now() - stime }
}

const wallOrientation = (height, width, bias) => {
    // console.log("bias: ", bias)
    if(height > width) 
        return "Horizontal"
    if(height < width) 
        return "Vertical"
    return Math.floor(Math.random() * 2) == 0 ? "Horizontal" : "Vertical"
}


function* KruskalsMazeLine(height, width) {
    console.log("in KruskalsMazeLine")
    var stime = Date.now()

    const findRoot = (p1, sets) => {
        const setP1 = sets[p1.y][p1.x]
        if(p1.x == setP1.x && p1.y == setP1.y) 
            return p1
        return sets[p1.y][p1.x] = findRoot({x: setP1.x, y: setP1.y}, sets)
    }

    const connect = (p1, p2, sets) => {
        const setP1 = findRoot(p1, sets)
        const setP2 = findRoot(p2, sets)
        sets[setP1.y][setP1.x] = setP2
    }
    const isConnected = (p1, p2, sets) => {
        const setP1 = findRoot(p1, sets)
        const setP2 = findRoot(p2, sets)
        return setP1.x == setP2.x && setP1.y == setP2.y
    }

    var edges = []
    var sets = []

    for(let y = 0; y < height; y++) {
        sets[y] = []
        for(let x = 0; x < width; x++) {
            sets[y][x] = {x: x, y: y}
            if(y > 0) edges.push({x: x, y: y, dir: Direction.N})
            if(x > 0) edges.push({x: x, y: y, dir: Direction.W})
            document.getElementById(`${y}-${x}`).className = "cell north south east west"
        }
    }

    while(edges.length > 0) {
        const {x, y, dir} = swapAndPop(edges)
        const nx = x + Direction.dx[dir]
        const ny = y + Direction.dy[dir]
        const p1 = {x: x, y: y}
        const p2 = {x: nx, y: ny}
        if(!isConnected(p1, p2, sets)) {
            connect(p1, p2, sets)
            unmarkClass(`${y}-${x}`, Direction.dirs[dir])
            unmarkClass(`${ny}-${nx}`, Direction.dirs[Direction.opposite[dir]])
        }
        markClass(`${y}-${x}`, "maze-frontier")
        markClass(`${ny}-${nx}`, "maze-frontier")
        yield
        unmarkClass(`${y}-${x}`, "maze-frontier")
        unmarkClass(`${ny}-${nx}`, "maze-frontier")
    }
    console.log("Done!!!")
    yield { message: "success", timeTaken: Date.now() - stime }
}


function* RecursiveBacktrackerLine(height, width, options) {
    console.log("in RecursiveBacktrackerLine")
    var stime = Date.now()

    resetLineGrid(height, width)

    const startCell = {
        x: Math.floor(Math.random() * width), 
        y: Math.floor(Math.random() * height)
    }
    const startId = `${startCell.y}-${startCell.x}`

    var stack = []
    var parents = {}
    stack.push(startId)
    parents[startId] = ""

    while(stack.length !== 0) {
        const top = stack.pop()
        markClass(top, "maze-frontier")
        if(!isVisitedInLinedMaze(top))
            mergeCells(parents[top], top)

        var neighbours = getNeighbours(top, height, width)
        shuffleArray(neighbours)

        for(nCell of neighbours) {
            if(isVisitedInLinedMaze(nCell)) continue
            stack.push(nCell)
            parents[nCell] = top
        }
        yield
        unmarkClass(top, "maze-frontier")
    }
    console.log("Done!!!")
    yield { message: "success", timeTaken: Date.now() - stime }
}


const getNeighbours = (cellId, height, width) => {
    var neighbours = []
    const [y, x] = cellId.split('-').map(i => parseInt(i))
    for(const dir in Direction.dx) {
        const nx = x + Direction.dx[dir]
        const ny = y + Direction.dy[dir]
        if(nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        const nCellId = `${ny}-${nx}`
        neighbours.push(nCellId)
    }
    return neighbours
}

function* PrimsMazeLine(height, width, options) {
    console.log("in PrimsMazeLine")
    var stime = Date.now()

    resetLineGrid(height, width)

    const startCell = {
        x: Math.floor(Math.random() * width), 
        y: Math.floor(Math.random() * height)
    }
    const startId = `${startCell.y}-${startCell.x}`

    var frontier = []
    var parents = {}
    frontier.push(startId)
    parents[startId] = ""

    while(frontier.length > 0) {
        const top = swapAndPop(frontier)
        unmarkClass(top, "maze-frontier")
        const neighbours = getNeighbours(top, height, width).filter(cell => !isVisitedInLinedMaze(cell))
        mergeCells(parents[top], top)
        for(nCellId of neighbours) {
            frontier.push(nCellId)
            parents[nCellId] = top
            markClass(nCellId, "maze-frontier")
        }
        yield
    }
    console.log("Done!!!")
    yield { message: "success", timeTaken: Date.now() - stime }
}


function* SidewinderLine(height, width, options) {
    console.log("in SidewinderLine")
    var stime = Date.now()

    resetLineGrid(height, width)

    var run
    for(let y = 0; y < height; y++) {
        run = []
        for(let x = 0; x < width; x++) {
            run.push({x: x, y: y})
            const dir = randBinaryInt() == 0 ? Direction.N : Direction.E
            
            if(y > 0 && (x == width-1 || dir == Direction.N)) {
                const cell = run[Math.floor(Math.random() * run.length)]
                mergeCells(`${cell.y}-${cell.x}`, `${cell.y-1}-${cell.x}`)
                run = []
            }
            else if(x < width-1) {
                mergeCells(`${y}-${x}`, `${y}-${x+1}`)
            }
            markClass(`${y}-${x}`, "maze-frontier")
            yield
            unmarkClass(`${y}-${x}`, "maze-frontier")
        }
    }
    console.log("Done!!!")
    yield { message: "success", timeTaken: Date.now() - stime }
}

function* BinaryTreeLine(height, width, options) {
    console.log("in BinaryTreeLine")
    var stime = Date.now()

    resetLineGrid(height, width)

    var counter = {0: 0, 1: 0, 2: 0}
    
    const bounds = {
        "se": {startX: 0, endX: width-2, startY: 0, endY: height-2, dir: {x: 1, y: 1}},
        "sw": {startX: 1, endX: width-1, startY: 0, endY: height-2, dir: {x: -1, y: 1}},
        "ne": {startX: 0, endX: width-2, startY: 1, endY: height-1, dir: {x: 1, y: -1}},
        "nw": {startX: 1, endX: width-1, startY: 1, endY: height-1, dir: {x: -1, y: -1}},
    }

    const bias = options?.biasDir || Object.keys(bounds)[randInt(4)]
    console.log(bias)

    const startY = bounds[bias].startY
    const endY = bounds[bias].endY
    const startX = bounds[bias].startX
    const endX = bounds[bias].endX
    const dy = bounds[bias].dir.y
    const dx = bounds[bias].dir.x
    
    var choice
    for(let y = startY; y <= endY; y++) {
        for(let x = startX; x <= endX; x++) {
            choice = randIntWithProbability([48, 48, 4])
            if(choice == 0) {
                mergeCells(`${y}-${x}`, `${y}-${x+dx}`)
                counter[0]++
            }
            else if(choice == 1){
                mergeCells(`${y}-${x}`, `${y+dy}-${x}`)
                counter[1]++
            }
            else {
                mergeCells(`${y}-${x}`, `${y}-${x+dx}`)
                mergeCells(`${y}-${x}`, `${y+dy}-${x}`)
                counter[2]++
            }
            markClass(`${y}-${x}`, "current")
            yield
            unmarkClass(`${y}-${x}`, "current")
        }
        if(startX == 1)
            mergeCells(`${y}-${startX+dx}`, `${y+dy}-${startX+dx}`)
        else
            mergeCells(`${y}-${endX+dx}`, `${y+dy}-${endX+dx}`)
    }
    for(let x = startX; x <= endX; x++) {
        if(startY == 1)
            mergeCells(`${startY+dy}-${x}`, `${startY+dy}-${x+dx}`)
        else
            mergeCells(`${endY+dy}-${x}`, `${endY+dy}-${x+dx}`)
    }
    console.log(counter)
    console.log("Done!!!")
    yield { message: "success", timeTaken: Date.now() - stime }
}

function* GrowingTreeLine(height, width, options) {
    console.log("in GrowingTreeLine")
    var stime = Date.now()

    resetLineGrid(height, width)

    const getNextCell = (set) => {
        // console.log("popStrategy : ", options?.popStrategy) 
        // return set.pop()
        // return randomPop(set, Math.floor(set.length/2))
        return swapAndPop(set)
    }

    const startCell = {x: randInt(width), y: randInt(height)}
    const startId = `${startCell.y}-${startCell.x}`

    var set = [startId]
    var parents = {}

    while(set.length > 0) {
        const top = getNextCell(set)
        mergeCells(parents[top], top)
        markClass(top, "maze-frontier")
        const neighbours = getNeighbours(top, height, width).filter(cell => !isVisitedInLinedMaze(cell))
        shuffleArray(neighbours)
        for(nCellId  of neighbours) {
            set.push(nCellId)
            parents[nCellId] = top
        }
        yield
        unmarkClass(top, "maze-frontier")
    }
    console.log("Done!!!")
    yield { message: "success", timeTaken: Date.now() - stime }
}