/**
 *
 * See https://github.com/neo4j/neo4j-browser/blob/0d0f7b99a7461cca82804ae8bc3297935eadd8fd/src/neo4j-arc/graph-visualization/GraphVisualizer/Graph/visualization/GraphGeometryModel.ts
 *
 *
 */
import { NodeType } from "../types";

const measureTextWidthByCanvas = (text: string, font: string, context: CanvasRenderingContext2D): number => {
  context.font = font;
  return context.measureText(text).width;
};

const cacheTextWidth = function () {
  const CATCH_SIZE = 100000;
  const textMeasureMap: { [key: string]: number } = {};
  const lruKeyList: string[] = [];
  return (key: string, calculate: () => number) => {
    const cached = textMeasureMap[key];
    if (cached) {
      return cached;
    } else {
      const result = calculate();
      if (lruKeyList.length > CATCH_SIZE) {
        delete textMeasureMap[lruKeyList.splice(0, 1).toString()];
        lruKeyList.push(key);
      }
      return (textMeasureMap[key] = result);
    }
  };
};

function measureText(
  text: string,
  fontFamily: string,
  fontSize: number,
  canvas2DContext: CanvasRenderingContext2D
): number {
  const font = `normal normal normal ${fontSize}px/normal ${fontFamily}`;
  return cacheTextWidth()(`[${font}][${text}]`, () => measureTextWidthByCanvas(text, font, canvas2DContext));
}

export const fitCaptionIntoCircle = (node: NodeType, canvas2DContext: CanvasRenderingContext2D) => {
  const fontFamily = "sans-serif";
  const fontSize = 6;
  // Roughly calculate max text length the circle can fit by radius and font size
  const maxCaptionTextLength = Math.floor((Math.pow(node.radius, 2) * Math.PI) / Math.pow(fontSize, 2));
  let nodeText = node.captionKey ? node.properties[node.captionKey] || "" : "";
  nodeText = nodeText.toString();
  const captionText = nodeText.length > maxCaptionTextLength ? nodeText.substring(0, maxCaptionTextLength) : nodeText;
  const measure = (text: string) => measureText(text, fontFamily, fontSize, canvas2DContext);
  const whiteSpaceMeasureWidth = measure(" ");

  const words = captionText.split(" ");

  const emptyLine = (lineCount: number, lineIndex: number) => {
    // Calculate baseline of the text
    const baseline = (1 + lineIndex - lineCount / 2) * fontSize;

    // The furthest distance between chord (top or bottom of the line) and circle centre
    const chordCentreDistance = lineIndex < lineCount / 2 ? baseline - fontSize / 2 : baseline + fontSize / 2;
    const maxLineWidth = Math.sqrt(Math.pow(node.radius, 2) - Math.pow(chordCentreDistance, 2)) * 2;
    return {
      node,
      text: "",
      baseline,
      remainingWidth: maxLineWidth,
    };
  };

  const addShortenedNextWord = (line: any, word: string): string => {
    while (word.length > 2) {
      const newWord = `${word.substring(0, word.length - 2)}\u2026`;
      if (measure(newWord) < line.remainingWidth) {
        return `${line.text.split(" ").slice(0, -1).join(" ")} ${newWord}`;
      }
      word = word.substring(0, word.length - 1);
    }
    return `${word}\u2026`;
  };

  const fitOnFixedNumberOfLines = function (lineCount: number) {
    const lines = [];
    const wordMeasureWidthList: number[] = words.map((word: string) => measure(`${word}`));
    let wordIndex = 0;
    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      const line = emptyLine(lineCount, lineIndex);
      while (
        wordIndex < words.length &&
        wordMeasureWidthList[wordIndex] < line.remainingWidth - whiteSpaceMeasureWidth
      ) {
        line.text = `${line.text} ${words[wordIndex]}`;
        line.remainingWidth -= wordMeasureWidthList[wordIndex] + whiteSpaceMeasureWidth;
        wordIndex++;
      }
      lines.push(line);
    }
    if (wordIndex < words.length) {
      lines[lineCount - 1].text = addShortenedNextWord(lines[lineCount - 1], words[wordIndex]);
    }
    return [lines, wordIndex];
  };

  let consumedWords = 0;
  const maxLines = (node.radius * 2) / fontSize;

  let lines = [emptyLine(1, 0)];
  // Typesetting for finding suitable lines to fit words
  for (let lineCount = 1; lineCount <= maxLines; lineCount++) {
    const [candidateLines, candidateWords] = fitOnFixedNumberOfLines(lineCount);

    // If the lines don't have empty line(s), they're probably good fit for the typesetting
    // @ts-expect-error
    if (!candidateLines.some((line: any) => !line.text)) {
      // @ts-expect-error
      lines = candidateLines;
      // @ts-expect-error
      consumedWords = candidateWords;
    }
    if (consumedWords >= words.length) {
      return lines;
    }
  }
  return lines;
};
