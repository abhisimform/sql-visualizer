import { STORAGE_KEYS } from "./constants.js";

export const queryStorage = {
  load() {
    return localStorage.getItem(STORAGE_KEYS.query) || "";
  },
  save(value) {
    localStorage.setItem(STORAGE_KEYS.query, value);
  }
};

export class ThemeStore {
  constructor(root = document.documentElement) {
    this.root = root;
  }

  getStoredTheme() {
    return localStorage.getItem(STORAGE_KEYS.theme);
  }

  getPreferredTheme() {
    const storedTheme = this.getStoredTheme();
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  apply(theme) {
    this.root.dataset.theme = theme;
  }

  set(theme) {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    this.apply(theme);
  }

  toggle() {
    const nextTheme = this.root.dataset.theme === "dark" ? "light" : "dark";
    this.set(nextTheme);
    return nextTheme;
  }
}
