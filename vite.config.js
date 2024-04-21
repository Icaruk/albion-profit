import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { BASENAME } from "./BASENAME";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: BASENAME,
});
