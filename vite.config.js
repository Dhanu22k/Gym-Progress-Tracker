import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Gym-Progress-Tracker/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
      },
    },
  },
});
