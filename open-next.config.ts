import { defineCloudflareConfig } from "@opennextjs/cloudflare"

const cloudflareConfig = defineCloudflareConfig()

const config = {
  ...cloudflareConfig,
  buildCommand: "node_modules/.bin/next build",
}

export default config
