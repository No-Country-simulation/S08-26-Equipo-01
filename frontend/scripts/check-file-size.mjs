import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url))
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

const files = await collectSourceFiles(sourceRoot)
const warnings = []
const violations = []

for (const file of files) {
  const content = await readFile(file, 'utf8')
  const lineCount = content.split(/\r?\n/).length
  const relativePath = path.relative(sourceRoot, file)

  if (lineCount > errorLimit) {
    violations.push({ file: relativePath, lines: lineCount })
  } else if (lineCount > warningLimit) {
    warnings.push({ file: relativePath, lines: lineCount })
  }
}

for (const warning of warnings) {
  console.warn(
    `[architecture] review ${warning.file}: ${warning.lines} lines (> ${warningLimit})`,
  )
}

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(
      `[architecture] ${violation.file}: ${violation.lines} lines exceeds hard limit of ${errorLimit}`,
    )
  }

  process.exitCode = 1
} else {
  console.log(
    `[architecture] checked ${files.length} source files; no file exceeds ${errorLimit} lines`,
  )
}
