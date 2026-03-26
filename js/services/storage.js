import { STORAGE_KEYS } from "../config/constants.js";
import { createLogger } from "./dev-logger.js";

const logger = createLogger("Storage");

export const queryStorage = {
  load() {
    const value = localStorage.getItem(STORAGE_KEYS.query) || "";
    logger.debug("storage.query", "query:load", { hasValue: Boolean(value), length: value.length });
    return value;
  },
  save(value) {
    logger.debug("storage.query", "query:save", { length: String(value || "").length });
    localStorage.setItem(STORAGE_KEYS.query, value);
  }
};

export class ThemeStore {
  constructor(root = document.documentElement) {
    this.root = root;
  }

  getStoredTheme() {
    const theme = localStorage.getItem(STORAGE_KEYS.theme);
    logger.debug("storage.theme", "theme:get-stored", { theme });
    return theme;
  }

  getPreferredTheme() {
    const storedTheme = this.getStoredTheme();
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  apply(theme) {
    logger.debug("storage.theme", "theme:apply", { theme });
    this.root.dataset.theme = theme;
  }

  set(theme) {
    logger.debug("storage.theme", "theme:set", { theme });
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    this.apply(theme);
  }

  toggle() {
    const nextTheme = this.root.dataset.theme === "dark" ? "light" : "dark";
    logger.debug("storage.theme", "theme:toggle", { nextTheme });
    this.set(nextTheme);
    return nextTheme;
  }
}
