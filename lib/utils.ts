import styleText from "data-text:../style.css";
import type { PlasmoGetStyle } from "plasmo";
export { cn } from "cn";

/**
 * Import this function in your content script UI,
 * then export it as `getStyle`
 * to load tailwind classes.
 */
export const loadTailwindClassesIntoContentScriptUi: PlasmoGetStyle = () => {
  const style = document.createElement("style");
  style.textContent = styleText;
  return style;
};