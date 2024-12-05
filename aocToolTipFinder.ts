/// <reference lib="dom" />

(function dfsForTitleAttr(element: HTMLElement, toolTips: string[] = []) {
  if (element.title) {
    toolTips.push(element.title)
    element.style.backgroundColor = 'red'
  }
  if (element.children) Array.from(element.children).forEach(child => dfsForTitleAttr(child as HTMLElement, toolTips))
  return toolTips
})(document.querySelector('main')!)

// Running 'bun build <filename>' will output the below code, which can be copy/pasted into the browser

/*

// aocToolTipFinder.ts
(function dfsForTitleAttr(element, toolTips = []) {
  if (element.title) {
    toolTips.push(element.title);
    element.style.backgroundColor = "red";
  }
  if (element.children)
    Array.from(element.children).forEach((child) => dfsForTitleAttr(child, toolTips));
  return toolTips;
})(document.querySelector("main"));

 * */
