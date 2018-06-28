#!/usr/bin/env node
var buffgapping = require('.')

process.stdin.pipe(buffgapping()).pipe(process.stdout)
