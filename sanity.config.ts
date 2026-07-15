import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "./src/sanity/schemaTypes"
import { structure } from "./src/sanity/structure"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5fcrgo8n"
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"

export default defineConfig({
  name: "comali-studio",
  title: "Comali Studio",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
