import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import process from 'node:process'

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function failedSteps(directory) {
  const report = JSON.parse(readFileSync(join(directory, 'report.json'), 'utf8'))
  if (!isRecord(report) || !Array.isArray(report.checks)) {
    throw new Error(`Invalid native check report: ${directory}`)
  }
  return report.checks.filter(isRecord).flatMap((check) => {
    if (!Array.isArray(check.steps) || (check.status !== 'failed' && check.status !== 'blocked')) {
      return []
    }
    return check.steps.filter(isRecord).filter(step => typeof step.log === 'string')
  })
}

function showFailures(directory) {
  for (const step of failedSteps(directory)) {
    const log = resolve(directory, step.log)
    if (!log.startsWith(`${directory}${sep}`)) {
      throw new Error('Native check logs must stay within their report directory')
    }
    process.stdout.write(readFileSync(log, 'utf8'))
  }
}

const root = resolve(process.argv[2] ?? '.zt/artifacts')
if (existsSync(root)) {
  const reports = readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('check-'))
    .map(entry => join(root, entry.name))
    .filter(directory => existsSync(join(directory, 'report.json')))
  for (const directory of reports) {
    showFailures(directory)
  }
}
