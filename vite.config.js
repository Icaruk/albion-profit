import path from "node:path";
import { paraglide } from "@inlang/paraglide-vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { BASENAME } from "./BASENAME";

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			// /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
			"@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
		},
	},
	plugins: [
		react(),
		paraglide({
			project: "./project.inlang", //Path to your inlang project
			outdir: "./src/paraglide", //Where you want the generated files to be placed
		}),
	],
	base: BASENAME,
});
