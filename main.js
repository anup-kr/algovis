

ctr = {
    height: 40,
    width: 40,
    start: "fixed",
    target: "fixed",
    mazeAlgo: 'recursive_division_block',
    maze_speed: 4,
    mazeIterator: null,
    searchAlgo: "bfs",
    search_speed: 25,
    pressedCell: {id: "", class: ""},
    running: false,
    searchIterator: null,
    runState: "YET_TO_START",

    setStartAndTarget: function() {
        if(ctr.start === "random")
            ctr.start = { 
                x: Math.floor(Math.random() * ctr.width), 
                y: Math.floor(Math.random() * ctr.height) 
            }
        else if (ctr.start === "fixed")
            ctr.start = { 
                x: Math.floor(ctr.width / 4), 
                y: Math.floor(ctr.height / 2) 
            }
        if(ctr.target === "random")
            ctr.target = { 
                x: Math.floor(Math.random() * ctr.width), 
                y: Math.floor(Math.random() * ctr.height) 
            }
        else if (ctr.target === "fixed")
            ctr.target = { 
                x: Math.floor(3 * ctr.width / 4), 
                y: Math.floor(ctr.height / 2) 
            }
        markClass({ x: ctr.start.x, y: ctr.start.y }, "start")    
        markClass({ x: ctr.target.x, y: ctr.target.y }, "end")
    },

    addEventListeners: function() {
        for(let i = 0; i < ctr.height; i++) {
            for(let j = 0; j < ctr.width; j++) {
                const cellId = `${i}-${j}`
                var cellObj = document.getElementById(cellId)
                cellObj.addEventListener("click", function() {
                    toggleCellClass(cellId, "maze-blocked")
                })

                cellObj.addEventListener("mouseup", function() {
                    if(ctr.pressedCell.class) {
                        markClass(this, ctr.pressedCell.class)
                        if(ctr.pressedCell.class == "start")
                            [ctr.start.y, ctr.start.x] = this.id.split("-").map(i => parseInt(i))
                        else if(ctr.pressedCell.class == "end")
                            [ctr.target.y, ctr.target.x] = this.id.split("-").map(i => parseInt(i))
                    }
                    ctr.pressedCell = {id: "", class: ""}
                })
                cellObj.addEventListener("mousedown", function() {
                    if(hasClass(this, "start"))
                        ctr.pressedCell = {id: this.id, class: "start"}
                    else if(hasClass(this, "end"))
                        ctr.pressedCell = {id: this.id, class: "end"}
                    else 
                        ctr.pressedCell = {id: this.id, class: "maze-blocked"}
                })
                cellObj.addEventListener("mouseenter", function() {
                    if(ctr.pressedCell.class == "maze-blocked") {
                        markClass(this, ctr.pressedCell.class)
                    }
                    else if(ctr.pressedCell.id) {
                        unmarkClass(ctr.pressedCell.id, ctr.pressedCell.class)
                        markClass(this, ctr.pressedCell.class)
                        ctr.pressedCell.id = this.id
                    }
                    if(ctr.runState === 'DONE' && ['start', 'end'].includes(ctr.pressedCell.class)) {
                        startOrPause('search', true)
                    }
                })
            }
        }
    },
    
    resetMaze: function() {
        for(let y = 0; y < ctr.height; y++) {
            for(let x = 0; x < ctr.width; x++) {
                document.getElementById(`${y}-${x}`).className = "cell"
            }
        }
    },

    startMaze: () => startOrPause('maze'),

    nextMoveMaze: () => nextMove(ctr.mazeIterator),

    saveMaze: function() {
        var gridData = {}
        var classesToSave = ['start', 'end', 'maze-blocked', 'north', 'south', 'east', 'west']
        for(let y = 0; y < ctr.height; y++) {
            for(let x = 0; x < ctr.width; x++) {
                const cellId = `${y}-${x}`
                var classes = ""
                for(const classname of classesToSave) {
                    if(hasClass(cellId, classname)) 
                        classes += ' ' + classname
                }
                gridData[cellId] = classes
            }
        }
        var saved = localStorage.getItem("savedMaze") || {}
        if(Object.keys(saved).length > 0) {
            saved = JSON.parse(saved)
        }
        saved[Date.now()] = gridData
        localStorage.setItem("savedMaze", JSON.stringify(saved))
    },

    startSearch: () => startOrPause('search'),

    nextMoveSearch: () => nextMove(ctr.searchIterator),

    resetSearch: function() {
        console.log("in resetSearch")
        for(let y = 0; y < ctr.height; y++) {
            for(let x = 0; x < ctr.width; x++) {
                var elem = document.getElementById(`${y}-${x}`)
                elem.classList.remove("visited", "path", "current")
            }
        }
    }
};

function startOrPause(mazeOrSearch, instant) {
    var iterator
    const setImmediate = instant ? setImmediateAnalogues[0] : setImmediateAnalogues[1]

    if(mazeOrSearch === 'maze') {
        iterator = ctr.mazeIterator
        if(['DONE', 'CHANGED'].includes(ctr.runState)) {
            if(ctr.runState === 'CHANGED')
                ctr.runState = 'PAUSED'
            iterator.return()
            ctr.resetMaze()
            ctr.mazeIterator = MazeGenerator(ctr.mazeAlgo, ctr.height, ctr.width)
            iterator = ctr.mazeIterator
        }
    }
    else {
        iterator = ctr.searchIterator
        if(['DONE', 'CHANGED'].includes(ctr.runState)) {
            if(ctr.runState === 'CHANGED') 
                ctr.runState = 'PAUSED'
            iterator.return()
            ctr.resetSearch()
            ctr.searchIterator = SearchAlgo(ctr.searchAlgo, ctr.height, ctr.width, ctr.start, ctr.target)
            iterator = ctr.searchIterator
        }
    }
    console.log(ctr.runState)
    ctr.runState = ['YET_TO_START', 'DONE', 'PAUSED'].includes(ctr.runState) ? 'RUNNING' : 'PAUSED'

    const nextStep = () => {
        if(['RUNNING', 'CHANGED'].includes(ctr.runState)) {
            const iterValue = iterator.next().value
            if(iterValue) {
                ctr.runState = 'DONE'
                mazeStartBtnObj = document.getElementById("startMazeBtn")
                mazeStartBtnObj.textContent = 'Start'
                console.log(iterValue)
                return iterValue
            }
            setImmediate(nextStep)
        }
    }
    nextStep()
}

function nextMove(iterator) {
    ctr.runState = 'PAUSED'
    const iterValue = iterator.next().value
    mazeStartBtnObj = document.getElementById("startMazeBtn")
    mazeStartBtnObj.textContent = 'Start'
    if(iterValue) {
        ctr.runState = 'DONE'
        return iterValue
    }
}


document.addEventListener('DOMContentLoaded', function() {
    new Maze(ctr.height, ctr.width).create()
    listSavedMazes()
    ctr.setStartAndTarget()
    ctr.addEventListeners()
    ctr.mazeIterator = MazeGenerator(ctr.mazeAlgo, ctr.height, ctr.width)
    ctr.searchIterator = SearchAlgo(ctr.searchAlgo, ctr.height, ctr.width, ctr.start, ctr.target)

    gridHeightObj = document.getElementById("grid-height")
    gridHeightObj.value = ctr.height
    gridHeightObj.addEventListener("input", function(){
        ctr.height = parseInt(this.value)
        ctr.mazeIterator = MazeGenerator(ctr.mazeAlgo, ctr.height, ctr.width)
        ctr.searchIterator = SearchAlgo(ctr.searchAlgo, ctr.height, ctr.width, ctr.start, ctr.target)
    })

    gridWidthObj = document.getElementById("grid-width")
    gridWidthObj.value = ctr.width
    gridWidthObj.addEventListener("input", function(){
        ctr.width = parseInt(this.value)
        ctr.mazeIterator = MazeGenerator(ctr.mazeAlgo, ctr.height, ctr.width)
        ctr.searchIterator = SearchAlgo(ctr.searchAlgo, ctr.height, ctr.width, ctr.start, ctr.target)
    })
    gridGenerateBtnObj = document.getElementById("grid-generate")
    gridGenerateBtnObj.addEventListener("click", function() {
        new Maze(ctr.height, ctr.width).create()
    })

    mazeSpeedObj = document.getElementById("maze-speed")
    mazeSpeedObj.value = ctr.speed
    mazeSpeedObj.addEventListener("input", function(){
        ctr.speed = this.value
    })
    mazeAlgoObj = document.getElementById("maze-algo")
    mazeAlgoObj.value = ctr.mazeAlgo
    mazeAlgoObj.addEventListener("change", function() {
        ctr.mazeAlgo = this.value
        ctr.runState = 'CHANGED'
        console.log(ctr.runState)
    })
    mazeStartBtnObj = document.getElementById("startMazeBtn")
    mazeStartBtnObj.addEventListener("click", function() {
        mazeStartBtnObj.textContent = ctr.runState === 'RUNNING' ? 'Start' : 'Pause'
        ctr.startMaze()
        markClass({ x: ctr.start.x, y: ctr.start.y }, "start")    
        markClass({ x: ctr.target.x, y: ctr.target.y }, "end")
    })
    
    mazeNextMoveBtnObj = document.getElementById("nextMoveMazeBtn")
    mazeNextMoveBtnObj.addEventListener("click", function() {
        ctr.nextMoveMaze()
    })

    mazeSaveBtnObj = document.getElementById("saveMazeBtn")
    mazeSaveBtnObj.addEventListener("click", async function() {
        await ctr.saveMaze()
        listSavedMazes()
    })

    searchAlgoObj = document.getElementById("search-algo")
    searchAlgoObj.value = ctr.searchAlgo
    searchAlgoObj.addEventListener("change", function() {
        ctr.searchAlgo = this.value
        ctr.runState = 'CHANGED'
    })

    document.getElementById("startSearchBtn").addEventListener("click", function() {
            ctr.startSearch()
    })
    document.getElementById("resetSearchBtn").addEventListener("click", function() {
        ctr.resetSearch()
    })
})

function addListenerOnCells(eventFuncList) {
    for(let i = 0; i < ctr.height; i++) {
        for(let j = 0; j < ctr.width; j++) {
            const cellId = `${i}-${j}`
            var cellObj = document.getElementById(cellId)
            for(const {event, func, except} of eventFuncList) {
                if(except && except.includes(cellId)) 
                    continue
                cellObj.addEventListener(event, func)
            }
        }
    }
}

function listSavedMazes() {
    htmlText = ""
    var saved = localStorage.getItem("savedMaze") || "{}"
    saved = JSON.parse(saved)
    for(const k of Object.keys(saved).reverse()) {
        console.log(k)
        const saveTime = new Date(parseInt(k)).toISOString()
        htmlText += `
        <li key=${k} value=${k}><span class="hiddenMaze">Do yo see me??</span>
            <span class="savedMazeItem">${saveTime}</span>
        </li>`
    }
    var ul = document.getElementById("savedMazesList")
    ul.innerHTML = htmlText
    for(const savedMazeObj of document.querySelectorAll("li")) {
        savedMazeObj.addEventListener('click', function() {
            loadSavedMaze(ctr.height, ctr.width, this.getAttribute('value'))
        })
    }
}

function loadSavedMaze(height, width, timestamp) {
    var saved = localStorage.getItem("savedMaze") || "{}"
    saved = JSON.parse(saved)
    if(saved.hasOwnProperty(timestamp)){
        loadMaze(height, width, saved[timestamp])
    }
}

function loadMaze(height, width, cellDetails) {
    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
            const cellId = `${i}-${j}`
            const cellObj = document.getElementById(cellId)
            cellObj.className = cellDetails[cellId] ? `cell ${cellDetails[cellId]}` : "cell"
        }
    }
}

