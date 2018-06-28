var buffgapping = require('./')
var crypto = require('crypto')

var buffgap = buffgapping()
var dwStreamTick = 0
var dwStreamShowing = false
var buffGapSlideSize = 0

function frame () {
  var lines = [
    'Last frame was ' + buffGapSlideSize + 'b',
    'Hello, this is a demo',
    'The time is: ' + Date.now() + 'ms since 1970',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Random data: ' + crypto.randomBytes(32).toString('hex') + ' ...',
    'And this line is static \\o/'
  ]

  if (Math.random() < 0.5) dwStreamTick++

  if (dwStreamTick === 5) {
    dwStreamTick = 0
    dwStreamShowing = !dwStreamShowing
  }

  if (dwStreamShowing) lines.push('Once in a while this line is here')

  lines.push(
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz',
    'Foo bar baz, foo bar baz, foo bar baz, foo bar baz'
  )

  return lines.join('\n')
}

buffgap.write(frame())
setInterval(function () {
  buffgap.write(frame())
}, 500)

buffgap.on('data', function (data) {
  buffGapSlideSize = data.length
  process.stdout.write(data)
})

process.stdout.on('resize', function () {
  buffgap.reset()
})
