import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

const require = createRequire(import.meta.url)
const root = process.cwd()
const clientPackagePath = require.resolve("@prisma/client/package.json")
const source = path.resolve(
  path.dirname(clientPackagePath),
  "../../.prisma/client/query_compiler_bg.wasm"
)

if (!existsSync(source)) {
  throw new Error(`Prisma query compiler WASM was not found at ${source}`)
}

const sourceRelativeToNodeModules = path.relative(
  path.join(root, "node_modules"),
  source
)
const destination = path.join(
  root,
  ".open-next/server-functions/default/node_modules",
  sourceRelativeToNodeModules
)

mkdirSync(path.dirname(destination), { recursive: true })
copyFileSync(source, destination)
const metaPath = path.join(
  root,
  ".open-next/server-functions/default/handler.mjs.meta.json"
)

if (existsSync(metaPath)) {
  const meta = JSON.parse(readFileSync(metaPath, "utf8"))
  const destinationRelativeToRoot = path.relative(root, destination)

  meta.inputs[destinationRelativeToRoot] = {
    bytes: statSync(destination).size,
    imports: [],
  }

  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`)
}

console.log(`Copied Prisma query compiler WASM to ${destination}`)
