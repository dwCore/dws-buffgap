var dws2 = require('@dwcore/dws2')
var isAnsi = require('ansi-regex')
var bufferFrom = require('buffer-from')

var MOVE_LEFT = bufferFrom('1b5b3130303044', 'hex')
var MOVE_UP = bufferFrom('1b5b3141', 'hex')
var MOVE_DOWN = bufferFrom('1b5b3142', 'hex')
var CLEAR_LINE = bufferFrom('1b5b304b', 'hex')
var NEWLINE = bufferFrom('\n')

module.exports = createDwStream

function buffGapLine (older, newer, gapbufs) {
  var min = Math.min(older.length, newer.length)

  for (var i = 0; i < min; i++) {
    if (older[i] !== newer[i]) break
  }

  if (!i || isAnsi().test(newer.slice(0, i))) {
    gapbufs.push(CLEAR_LINE)
    gapbufs.push(bufferFrom(newer + '\n'))
  } else {
    var findGap = newer.slice(i)
    gapbufs.push(bufferFrom('1b5b' + bufferFrom('' + i).toString('hex') + '43', 'hex'))
    gapbufs.push(bufferFrom(findGap))
    gapbufs.push(CLEAR_LINE)
    gapbufs.push(NEWLINE)
  }
}

function createDwStream () {
  var prevDwStream = []
  var dwStream = dws2(writeDwStream)

  dwStream.resetDwStream = function () {
    for (var i = 0; i < prevDwStream.length; i++) {
      prevDwStream[i] = '###############'
    }
  }

  dwStream.clear = function () {
    dwStream.resetDwStream()
    dwStream.writeDwStream('')
  }

  return dwStream

  function writeDwStream (data, enc, cb) {
    var dwStreamString = data.toString()
    var dwStreamLines = dwStreamString ? dwStreamString.split('\n') : []
    var buffgap = Array(dwStreamLines.length)
    var buffGapPosition = -1
    var i = 0

    for (i = 0; i < dwStreamLines.length; i++) {
      if (i < prevDwStream.length) {
        var old = prevDwStream[i]
        if (old !== dwStreamLines[i]) {
          if (buffGapPosition === -1) buffGapPosition = i
          buffgap[i] = 1
        } else {
          buffgap[i] = 0
        }
      } else {
        buffgap[i] = 2
      }
    }

    var gapbufs = []
    var dwStreamMovedOnce = false

    for (i = dwStreamLines.length; i < prevDwStream.length; i++) {
      if (!dwStreamMovedOnce) {
        gapbufs.push(MOVE_LEFT)
        dwStreamMovedOnce = true
      }
      gapbufs.push(MOVE_UP)
      gapbufs.push(CLEAR_LINE)
    }

    if (buffGapPosition > -1) {
      var missing = Math.min(prevDwStream.length, dwStreamLines.length) - buffGapPosition
      gapbufs.push(bufferFrom('1b5b' + bufferFrom('' + missing).toString('hex') + '41', 'hex'))
    } else {
      buffGapPosition = prevDwStream.length
    }

    for (; buffGapPosition < dwStreamLines.length; buffGapPosition++) {
      if (!dwStreamMovedOnce) {
        gapbufs.push(MOVE_LEFT)
        dwStreamMovedOnce = true
      }
      if (buffgap[buffGapPosition] > 0) {
        if (buffgap[buffGapPosition] === 1) buffGapLine(prevDwStream[buffGapPosition], dwStreamLines[buffGapPosition], gapbufs)
        else gapbufs.push(bufferFrom(dwStreamLines[buffGapPosition] + '\n'))
      } else {
        gapbufs.push(MOVE_DOWN)
      }
    }

    prevDwStream = dwStreamLines
    cb(null, Buffer.concat(gapbufs))
  }
}
