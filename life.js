Life = function(options) {
			var self = this
			var live = 1
			var dead = 0
			var activeX = -1
			var activeY = -1
			var currentPop = -1
			var cyclesAtCurrentPop = 0
			var canvasWidth
			var canvasHeight
			var ctx
			self.running = false
			self.result = ''
			var grid = []
			self.mousedown = false
			var onComplete
			var onStart
			var onGetCellInfo
			self.infoMode = false
			self.cycleTime = options.cycleTime ? options.cycleTime : 0
			
			self.cycles = options.cycles ? options.cycles : -1
			
			if (options.colors) {
				self.colors = options.colors
			} else {
				self.colors = {}
				self.colors[live] = '#222'
				self.colors[dead] = '#FFF'
			}
			
			if (options.canvas) {
				self.canvas = options.canvas
				canvasHeight = $(canvas).height()
				canvasWidth = $(canvas).width()
				ctx = canvas.getContext('2d')
			}else throw 'must define a canvas'
			
			if (options.cellSize) {
				self.cellSize = options.cellSize;
			}else throw 'must define cell size'
			
			if (options.stableIn) {
				self.stableIn = options.stableIn
			}else throw 'must define max cycles for stabilization: {stableIn : 40}'
			
			
			onComplete = options.onComplete ? options.onComplete : function() {}
			onStart = options.onStart ? options.onStart : function() {}
			onGetCellInfo = options.onGetCellInfo ? options.onGetCellInfo : function() {}
			
			self.padding = options.padding ? options.padding : 0
			
			self.allDead = function() {	
				for(i = 0; i < maxCols(); i++) {
					for (j = 0; j < maxRows(); j++) {
						grid[i][j] = dead
					}
				}
				draw()
			}
			
			self.allAlive= function() {
				for(i = 0; i < maxCols(); i++) {
					for (j = 0; j < maxRows(); j++) {
						grid[i][j] = live
					}
				}
				draw()
			}
			
			self.randomize = function() {
				for (i = 0; i < maxCols(); i ++) {
					grid[i] = []
					for (j = 0; j < maxRows(); j++) {
						rand = Math.random()
						alive = rand > 0.5
						grid[i][j] = alive ? live : dead
					}
				}
				
				draw()
			}
			
			self.randomize()
			
			self.run = function() {
				onStart();
				self.running = true
				setTimeout(function() {cycle(0, self.cycles)}, self.cycleTime)
			}
			
			self.cellInfo = function(clickEvent) {
				var cell = this
				cell.x = Math.floor(offsetX(clickEvent) / this.cellSize)
				cell.y = Math.floor(offsetY(clickEvent) / this.cellSize)
				cell.liveNeighbors = liveNeighbors(cell.x, cell.y)
				cell.deadNeighbors = 8 - cell.liveNeighbors
				cell.status = grid[cell.x][cell.y]
				cell.future = valueAfterCycle(cell.x, cell.y)
				return cell
			}
			
			$(canvas).mousedown(function(e) {
				self.mousedown = true
				i = Math.floor(offsetX(e) / self.cellSize)
				j = Math.floor(offsetY(e) / self.cellSize)
				if (!self.infoMode && !self.running) {
					activeX = i
					activeY = j
					grid[i][j] = (grid[i][j] + 1) % 2
					drawRect(i, j)
				} else {
					onGetCellInfo(self.cellInfo(e))
				}
			})
			
			$(canvas).mousemove(function(e) {
				if (!self.infoMode && self.mousedown && !self.running) {
					i = Math.floor(offsetX(e) / self.cellSize)
					j = Math.floor(offsetY(e) / self.cellSize)
					if (activeX != i || activeY != j) {
						activeX = i
						activeY = j
						grid[i][j] = (grid[i][j] + 1) % 2
						drawRect(i, j)
					}
				}
			})
			
			$(canvas).mouseup(function(e) {
				self.mousedown = false
			})
			
			function complete(results) {
				self.running = false
				self.result = results
				currentPop = -1
				cyclesAtCurrentPop = 0
				onComplete();
			}
			
			function cycle(i, max) {
				if (!self.running) { complete('Stopped manually after ' + i + ' cycles'); return; }
				if (i == max) { complete('Completed after ' + i + ' cycles'); return; }
				pop = population()
				if (currentPop == pop) {
					if (++cyclesAtCurrentPop == self.stableIn) {
						complete('Population stabilized at ' + pop + ' after ' + (i - self.stableIn) + ' cycles.')
						return;
					}
				}
				currentPop = pop
				//if (max > -1) { $('#cyclesTitle').html('Remaining Cycles') } else { $('#cyclesTitle').html('Cycles iterated') }
				$('#remainingCycles').html(Math.abs(max - i - 1))
				newGrid = []
				for (x = 0; x < maxCols(); x++) {
					newGrid[x] = []
					for (y = 0; y < maxRows(); y++) {
						newGrid[x][y] = valueAfterCycle(x, y)
					}
				}
				
				grid = newGrid
				draw()
				setTimeout(function() {cycle(i + 1, max)}, self.cycleTime);
				return;
			}
			
			self.stop = function() {
				self.running = false
			}
			
			function drawRect(i, j) {
				ctx.fillStyle = self.colors[grid[i][j]]
				ctx.fillRect(i * Math.floor(canvasWidth / maxCols()), j * Math.floor(canvasHeight / maxRows()), Math.floor(canvasWidth / maxCols()) - self.padding, Math.floor(canvasHeight / maxRows()) - self.padding);
			}
			
			
			function offsetX(event) {
				if (event.offsetX != undefined) return event.offsetX
				if (event.layerX != undefined) return event.layerX
				return event.pageX - $(self.canvas).offset().left
			}
			
			function offsetY(event) {
				if (event.offsetY != undefined) return event.offsetY
				if (event.layerY != undefined) return event.layerY
				return event.pageY - $(self.canvas).offset().top
			}
		
			function maxRows() {
				return Math.floor(canvasHeight / self.cellSize)
			}
			
			function maxCols() {
				return Math.floor(canvasWidth / self.cellSize)
			}

			function liveNeighbors(i, j) {
				rN = (i + 1) % grid.length
				lN = i - 1 < 0 ? grid.length - 1 : i - 1
				bN = (j + 1) % grid[i].length
				uN = j - 1 < 0 ? grid[i].length - 1 : j - 1
				neighbors = 0
				if (grid[rN][j] == live) neighbors++
				if (grid[lN][j] == live) neighbors++
				if (grid[rN][uN] == live) neighbors++
				if (grid[rN][bN] == live) neighbors++
				if (grid[lN][uN] == live) neighbors++
				if (grid[lN][bN] == live) neighbors++
				if (grid[i][uN] == live) neighbors++
				if (grid[i][bN] == live) neighbors++
				
				return neighbors
			}
		
			function draw() {
				for (i = 0; i < maxCols(); i++) {
					for (j = 0; j < maxRows(); j++) {
						drawRect(i, j);
					}
				}
			}
			
			function valueAfterCycle(i, j) {
				numOfNeighbors = liveNeighbors(i, j)
				if (numOfNeighbors == 3) return live
				if (grid[i][j] == live) { return numOfNeighbors == 2 ? live : dead}
				return dead;
			}
			
			function population() {
				pop = 0
				for (x = 0; x < grid.length; x++) {
					for (y = 0; y < grid[x].length; y++) {
						if (grid[x][y] == live) pop++
					}
				}
				return pop
			}
		}