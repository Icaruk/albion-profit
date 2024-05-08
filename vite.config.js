import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { BASENAME } from "./BASENAME";
import { paraglide } from "@inlang/paraglide-vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		paraglide({
			project: "./project.inlang", //Path to your inlang project
			outdir: "./src/paraglide", //Where you want the generated files to be placed
		}),
	],
	base: BASENAME,
});
