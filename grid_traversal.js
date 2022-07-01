
const SearchAlgo = (searchAlgo, height, width, startPoint, endPoint, options) => {
    const algos = {
        "dfs": DFS,
        "bfs": BFS,
        "astar": Astar
    }
    const algo = algos[searchAlgo]
    if(algo) return algo(height, width, startPoint, endPoint, options)
    console.log(`${searchAlgo} not found :-(`)
}


const tracePathForBFS = (parents, start, target) => {
    console.log("in tracePathForBFS")
    var path = []
    var target = document.querySelector(".end").id
    while(target != start) {
        target = parents[target]
        path.push(target)
    }
    path.pop()
    path.reverse()

    for(let cellId of path) {
        markClass(cellId, "path", "visited")
    }
}

const getNeighboursForBFS = (cellId, height, width) => {
    var neighbours = []
    const [y, x] = cellId.split('-').map(i => parseInt(i))
    for(const dir in Direction.dx) {
        const nx = x + Direction.dx[dir]
        const ny = y + Direction.dy[dir]
        if(nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        const nCellId = `${ny}-${nx}`
        const nCellObj = document.getElementById(nCellId)
        if(hasAnyClass(nCellObj, `visited start, maze-blocked ${Direction.dirs[Direction.opposite[dir]]}`)) 
            continue
        neighbours.push(nCellId)
    }
    return neighbours
}

function* BFS(height, width, start, target) {
    console.log("in BFS")
    const startId = `${start.y}-${start.x}`
    const targetId = `${target.y}-${target.x}`

    var q = new Queue()
    var parents = {}

    var stime = Date.now()
    q.enqueue(startId)
    parents[startId] = "null"
    markClass(startId, "visited")
    var visitedCount = 1

    while(!q.isEmpty()) {
        const top = q.dequeue()
        if(top == document.querySelector(".end").id) {
            tracePathForBFS(parents, startId, top)
            var etime = Date.now()
            yield {visitedCount: visitedCount, message: "success", timeTaken: etime - stime}
        }
        
        const neighbours = getNeighboursForBFS(top, height, width)
        for(nCellId of neighbours) {
            markClass(nCellId, "current")
            q.enqueue(nCellId)
            parents[nCellId] = top
            visitedCount++
            yield
            markClass(nCellId, "visited", "current")
        }
    }
    console.log("Done!!!")
    var etime = Date.now()
    yield {visitedCount: visitedCount, message: "target_not_found", timeTaken: etime - stime}
}

function* DFS(height, width, start, target) {
    console.log("in DFS")
    const startId = `${start.y}-${start.x}`
    const targetId = `${target.y}-${target.x}`

    var s = [] //stack
    var parents = {}
    
    var stime = Date.now()
    s.push(startId)
    parents[startId] = "null"
    markClass(startId, "visited")
    var visitedCount = 1

    while(s.length !== 0) {
        const top = s.pop()
        if(top == document.querySelector(".end").id) {
            tracePathForBFS(parents, startId, top)
            var etime = Date.now()
            yield {visitedCount: visitedCount, message: "success", timeTaken: etime - stime}
        }
        // await timer(1)
        yield
        markClass(top, "visited", "current")
        const neighbours = getNeighboursForBFS(top, height, width)
        for(nCellId of neighbours) {
            s.push(nCellId)
            parents[nCellId] = top
            visitedCount++
        }
        if(s.at(-1))
            markClass(s.at(-1), "current")
    }
    console.log("Done!!!")
    var etime = Date.now()
    yield {visitedCount: visitedCount, message: "target_not_found", timeTaken: etime - stime}
}

const FLT_MAX = 10e12

function* Astar(height, width, start, target) {
    console.log("in Astar")
    const startId = `${start.y}-${start.x}`
    const targetId = `${target.y}-${target.x}`

    var s = new Set()
    var cellDetails = {}
    var parents = {}
    var stime = Date.now()

    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
            cellDetails[`${i}-${j}`] = { f: FLT_MAX, g: FLT_MAX, h: FLT_MAX }
        }
    }

    s.add(startId)
    parents[startId] = "null"
    cellDetails[startId] = {f: 0, g: 0, h: 0}
    markClass(startId, "visited")
    var visitedCount = 1

    while(s.size != 0) {
        var fMin = FLT_MAX
        var top
        for(cellId of s) {
            if(cellDetails[cellId].f < fMin) {
                fMin = cellDetails[cellId].f
                top = cellId
            }
        }
        s.delete(top)

        if(top == document.querySelector(".end").id) {
            tracePathForBFS(parents, startId, top)
            const etime = Date.now()
            yield {visitedCount: visitedCount, message: "success", timeTaken: etime - stime}
        }

        const neighbours = getNeighboursForBFS(top, height, width)
        for(nCellId of neighbours) {
            const [ny, nx] = nCellId.split('-').map(i => parseInt(i))
            const gNew = cellDetails[top].g + 1
            const hNew = getHValue(nx, ny, target)
            const fNew = gNew + hNew

            if(cellDetails[nCellId].f > fNew) {
                markClass(nCellId, "current")
                s.add(nCellId)
                parents[nCellId] = top
                cellDetails[nCellId] = { f: fNew, g: gNew, h: hNew }
                // await timer(1)
                yield
                markClass(nCellId, "visited", "current")
                visitedCount++
            }
        }
    }
    console.log("Done!!!")
    var etime = Date.now()
    yield {visitedCount: visitedCount, message: "target_not_found", timeTaken: etime - stime}

}

const getHValue = (x, y, target) => {
    return (target.y - y)*(target.y - y) + (target.x - x)*(target.x - x)
    // return Math.sqrt((target.y - y)*(target.y - y) + (target.x - x)*(target.x - x))
    // const dy = Math.abs(target.y - y)
    // const dx = Math.abs(target.x - x)
    // return dx + dy
    // return dx + dy + 0.586 * Math.min(dx, dy)
}