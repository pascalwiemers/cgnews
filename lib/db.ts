import "server-only"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { PrismaD1 } from "@prisma/adapter-d1"
import { Prisma, PrismaClient as WorkerPrismaClient } from "@prisma/client/wasm"

type DbClient = InstanceType<typeof WorkerPrismaClient>
type CloudflareEnvWithD1 = CloudflareEnv & {
  DB?: D1Database
}
type LibSqlAdapterModule = typeof import("@prisma/adapter-libsql")
type NodePrismaModule = typeof import("@prisma/client")

declare global {
  // Local Node-only fallback for scripts/build tooling and non-Worker dev.
  // eslint-disable-next-line no-var
  var localPrisma: DbClient | undefined
}

const prismaLog: Prisma.LogLevel[] =
  process.env.NODE_ENV === "development"
    ? ["query", "warn", "error"]
    : ["error"]

function canUseLocalDbFallback() {
  const requestedRuntime = process.env.CGNEWS_DB_RUNTIME as string | undefined

  return requestedRuntime === "local"
}

function localSqliteUrl() {
  const databaseUrl = process.env.DATABASE_URL || "file:./dev.db"

  if (
    databaseUrl.startsWith("file:./") &&
    !databaseUrl.startsWith("file:./prisma/")
  ) {
    return `file:./prisma/${databaseUrl.slice("file:./".length)}`
  }

  return databaseUrl
}

export async function createLocalDbClient() {
  const dynamicImport = new Function(
    "specifier",
    "return import(specifier)"
  ) as (specifier: string) => Promise<LibSqlAdapterModule | NodePrismaModule>
  const [{ PrismaLibSQL }, { PrismaClient: NodePrismaClient }] =
    (await Promise.all([
      dynamicImport("@prisma/adapter-libsql"),
      dynamicImport("@prisma/client"),
    ])) as [LibSqlAdapterModule, NodePrismaModule]
  const adapter = new PrismaLibSQL({ url: localSqliteUrl() })
  return new NodePrismaClient({ adapter, log: prismaLog }) as DbClient
}

export async function getLocalDb() {
  if (!globalThis.localPrisma) {
    globalThis.localPrisma = await createLocalDbClient()
  }
  return globalThis.localPrisma
}

async function getD1Binding() {
  if (canUseLocalDbFallback()) {
    return null
  }

  let context: Awaited<ReturnType<typeof getCloudflareContext>>

  try {
    context = await getCloudflareContext({ async: true })
  } catch (error) {
    throw error
  }

  const db = (context.env as CloudflareEnvWithD1).DB

  if (!db) {
    throw new Error(
      "Cloudflare D1 binding `DB` is missing. Create/bind the D1 database before using the Worker runtime."
    )
  }

  return db
}

export async function getDb(): Promise<DbClient> {
  const d1 = await getD1Binding()

  if (!d1) {
    return await getLocalDb()
  }

  const adapter = new PrismaD1(d1)
  return new WorkerPrismaClient({ adapter, log: prismaLog })
}
