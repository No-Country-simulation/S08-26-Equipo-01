import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url))
const baselinePath = fileURLToPath(
  new URL('./architecture-baseline.json', import.meta.url),
)
const warningLimit = 300
const errorLimit = 500

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      if (entry.name === 'generated') continue
      files.push(...(await collectSourceFiles(absolutePath)))
      continue
    }

    if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.includes('.generated.')) {
      files.push(absolutePath)
    }
  }

  return files
}

const baseline = JSON.parse(await readFile(baselinePath, 'utf8'))
const files = await collectSourceFiles(sourceRoot)
const warnings = []
const baselineDebt = []
const violations = []

for (const file of files) {
  const content = await readFile(file, 'utf8')
  const lineCount = content.split(/\r?\n/).length
  const relativePath = path.relative(sourceRoot, file).split(path.sep).join('/')

  if (lineCount > errorLimit) {
    const baselineLimit = baseline[relativePath]

    if (typeof baselineLimit === 'number' && lineCount <= baselineLimit) {
      baselineDebt.push({ file: relativePath, lines: lineCount, baselineLimit })
    } else {
      violations.push({ file: relativePath, lines: lineCount, baselineLimit })
    }
  } else if (lineCount > warningLimit) {
    warnings.push({ file: relativePath, lines: lineCount })
  }
}

for (const warning of warnings) {
  console.warn(
    `[architecture] review ${warning.file}: ${warning.lines} lines (> ${warningLimit})`,
  )
}

for (const debt of baselineDebt) {
  console.warn(
    `[architecture] baseline debt ${debt.file}: ${debt.lines} lines (baseline ${debt.baselineLimit}; do not grow, split when touched)`,
  )
}

if (violations.length > 0) {
  for (const violation of violations) {
    const suffix =
      typeof violation.baselineLimit === 'number'
        ? ` and exceeds baseline ${violation.baselineLimit}`
        : ' and is not in the architecture baseline'

    console.error(
      `[architecture] ${violation.file}: ${violation.lines} lines exceeds hard limit of ${errorLimit}${suffix}`,
    )
  }

  process.exitCode = 1
} else {
  console.log(
    `[architecture] checked ${files.length} source files; no new or growing >${errorLimit}-line violations`,
  )
}
