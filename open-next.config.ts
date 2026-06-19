import { defineCloudflareConfig } from "@opennextjs/cloudflare"

const cloudflareConfig = defineCloudflareConfig()

export default {
  ...cloudflareConfig,
  buildCommand: "node_modules/.bin/next build",
}
