import { deepEqual } from "fast-equals";
import { clamp, isArray, mapValues } from "remeda";

export type Vector2 = [number, number];

export interface Point {
  x: number;
  y: number;
}

export interface Circle extends Point {
  radius: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface Rect extends Point, Dimension {}

export function lerp(min: number, max: number, progress: number) {
  return min + (max - min) * progress;
}

export function progress(min: number, max: number, value: number) {
  return max - min === 0 ? 1 : (value - min) / (max - min);
}

export function transform(
  iMin: number,
  iMax: number,
  oMin: number,
  oMax: number,
  v: number
) {
  return lerp(oMin, oMax, progress(iMin, iMax, v));
}

/**
 * calculate for the d
 * a:b = c:d
 */
export function transformNumber(
  inputRange: number,
  outputRange: number,
  input: number
) {
  return (outputRange * input) / inputRange;
}

export function transformPoint(point: Point, input: Vector2, output: Vector2) {
  // destinationMaxDimension * source / sourceMaxDimension
  return {
    x: (output[0] * point.x) / input[0],
    y: (output[1] * point.y) / input[1],
  };
}

export function center(
  container: Dimension,
  objectPosition: Point,
  scale: number = 1
) {
  const newX = container.width / 2 - objectPosition.x * scale;
  const newY = container.height / 2 - objectPosition.y * scale;

  return { x: newX, y: newY };
}

export function centerVec2(
  container: Dimension,
  objectPosition: Vector2,
  scale: number = 1
) {
  const newX = container.width / 2 - objectPosition[0] * scale;
  const newY = container.height / 2 - objectPosition[1] * scale;

  return [newX, newY];
}

export function scale<T extends { [key: string]: unknown } | unknown[]>(
  obj: T,
  factor: number
): T {
  if (Array.isArray(obj)) return obj.map((v) => (v as number) * factor) as T;

  return mapValues(obj, (v) => (v as number) * factor) as T;
}

export function delta(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function objectCenter(dimension: Vector2 | Dimension): Point {
  if (isArray(dimension)) return { x: dimension[0] / 2, y: dimension[1] / 2 };
  return { x: dimension.width / 2, y: dimension.height / 2 };
}

/** Adjusts a given point to lie on the circumference of a circle if it's not already in the circle's radius. */
export function adjustPointToCircle(p: Point, c: Point, r: number) {
  if (inRadius(p, c, r)) return p;

  let theta = Math.atan2(p.y - c.y, p.x - c.x);
  return { x: c.x + r * Math.cos(theta), y: c.y + r * Math.sin(theta) };
}

export function pivotTransform(
  origin: Point,
  input: Point,
  scale: number
): Point {
  const deltaX = input.x - origin.x;
  const deltaY = input.y - origin.y;

  const newX = origin.x + deltaX * scale;
  const newY = origin.y + deltaY * scale;

  return { x: newX, y: newY };
}

export function toFixed(value: number, decimal: number = 1) {
  return Math.round(value * 10 ** decimal) / 10 ** decimal;
}

export function interpolatePoint(a: Point, b: Point, scale: number): Point {
  return {
    x: toFixed(lerp(a.x, b.x, scale), 3),
    y: toFixed(lerp(a.y, b.y, scale), 3),
  };
}

export function interpolateNumber(
  values: number[],
  t: number,
  decimal = 3
): number {
  // nth index
  const n = values.length - 1;

  // The current index given t
  const i = clamp(Math.floor(t * n), { min: 0, max: n - 1 });

  const start = values[i];
  const end = values[i + 1];
  const progress = (t - i / n) * n;

  return toFixed(lerp(start, end, progress), decimal);
}

export function inRadius({ x, y }: Point, { x: cx, y: cy }: Point, r: number) {
  let d2 = (x - cx) ** 2 + (y - cy) ** 2;
  return d2 <= r ** 2;
}

export function clampToRect(
  a: Point,
  { width, height, x: rx, y: ry }: Rect
): Point {
  // Check if the point is inside the rectangle
  if (a.x >= rx && a.x <= rx + width && a.y >= ry && a.y <= ry + height) {
    return a;
  }

  return {
    x: clamp(a.x, { min: rx, max: rx + width }),
    y: clamp(a.y, { min: ry, max: ry + height }),
  };
}

/**
 * This preserves the direction (angle) of the point relative to the center of the rectangle,
 * @param a
 * @param param1
 * @returns
 */
export function lineIntersectionOnRect(
  a: Point,
  { width, height, x: rx, y: ry }: Rect
): Point {
  // Check if the point is inside the rectangle
  if (a.x >= rx && a.x <= rx + width && a.y >= ry && a.y <= ry + height) {
    return a;
  }

  // center of rectangle
  let xC = width / 2 + rx;
  let yC = height / 2 + ry;

  let w = width / 2;
  let h = height / 2;

  let dx = a.x - xC;
  let dy = a.y - yC;

  let tan_phi = h / w;
  let tan_theta = Math.abs(dy / dx);

  //tell me in which quadrant the A point is
  let qx = Math.sign(dx);
  let qy = Math.sign(dy);

  if (tan_theta > tan_phi) {
    return { x: xC + (h / tan_theta) * qx, y: yC + h * qy };
  }

  return { x: xC + w * qx, y: yC + w * tan_theta * qy };
}

export function convertHexFromString(hex: string) {
  return parseInt(hex.replace("#", ""), 16);
}

export function capitalizeFirst(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

/**
 * Only works for SCREAMING_SNAKE_CASE.
 */
export function enumToString(value: string) {
  return `${value}`
    .split("_")
    .map((part) => capitalizeFirst(part.toLowerCase()))
    .join(" ");
}

/**
 * Only works for camelCase.
 */
export function enumToStringCC(value: string) {
  return `${value}`
    .split(/(?=[A-Z])/)
    .map((part) => capitalizeFirst(part.toLowerCase()))
    .join(" ");
}

export function bezier(
  t: number,
  initial: number,
  p1: number,
  p2: number,
  final: number
) {
  return (
    (1 - t) * (1 - t) * (1 - t) * initial +
    3 * (1 - t) * (1 - t) * t * p1 +
    3 * (1 - t) * t * t * p2 +
    t * t * t * final
  );
}

/** see https://github.com/darkskyapp/binary-search */
export function binarySearch<T, Q>(
  haystack: T[],
  needle: Q,
  comparator: (a: T, b: Q, index?: number, haystack?: T[]) => number,
  low?: number,
  high?: number
) {
  let mid, cmp;

  if (low === undefined) low = 0;
  else {
    low = low | 0;
    if (low < 0 || low >= haystack.length)
      throw new RangeError("invalid lower bound");
  }

  if (high === undefined) high = haystack.length - 1;
  else {
    high = high | 0;
    if (high < low || high >= haystack.length)
      throw new RangeError("invalid upper bound");
  }

  while (low <= high) {
    mid = low + ((high - low) >>> 1);
    cmp = +comparator(haystack[mid], needle, mid, haystack);

    if (cmp < 0.0) low = mid + 1;
    else if (cmp > 0.0) high = mid - 1;
    else return mid;
  }

  return ~low;
}

/**
 * i.e if I have 200 as "whole" and 10 as percentage
 * this will return 20 (10 percent of 200 is 20)
 *
 */
export function percentOf(percentage: number, value: number) {
  return (percentage / 100) * value;
}

export function calculateScaleFactor(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  const widthScale = maxWidth / width;
  const heightScale = maxHeight / height;

  return { widthScale, heightScale };
}

/**
 * will calculate the correct aspect ratio for both width and height
 *
 * example:
 * width = 1920
 * height = 1080
 * ratio: 4:3
 *
 * this will return
 * { width: 1440, height: 1080 }
 */
export function calculateRatioDimensions(
  width: number,
  height: number,
  aspectRatio: string
) {
  const parts = aspectRatio.split(":");

  if (parts.length < 2) {
    throw new Error('aspectRatio must be in format of "a:b"');
  }

  const antecedent = Number(parts[0]);
  const consequent = Number(parts[1]);

  const ratio = antecedent / consequent;

  return resizeRectToFitAspectRatio({ width, height }, ratio);
}

/**
 * return the ratio
 * example:
 * a = 1920
 * b = 1080
 * return [16, 9] // 16:9
 */
export function aspectRatioOf(width: number, height: number) {
  // Find the greatest common divisor
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const divisor = gcd(width, height);

  return [width / divisor, height / divisor] as const;
}

/**
 * @param rect1 - the rectangle to resize
 * @param rect2 - the source / template rectangle
 */
export function resizeRectToFit(rect1: Dimension, rect2: Dimension): Dimension {
  // Calculate scaling factors for width and height
  let scale = Math.min(rect2.width / rect1.width, rect2.height / rect1.height);

  return { width: rect1.width * scale, height: rect1.height * scale };
}

/**
 * @param rect1 - the rectangle to resize
 * @param aspectRatio - aspectRatio
 */
export function resizeRectToFitAspectRatio(
  rect1: Dimension,
  aspectRatio: number
): Dimension {
  let newHeight = Math.min(rect1.width / aspectRatio, rect1.height);
  return { width: aspectRatio * newHeight, height: newHeight };
}

export function dimToVector(dimension: Dimension): Vector2 {
  return [dimension.width, dimension.height];
}

export function vectorTodim(vect: Vector2): Dimension {
  return { width: vect[0], height: vect[1] };
}

export function pointToVector(point: Point): Vector2 {
  return [point.x, point.y];
}

export function vectorToPoint(vect: Vector2): Point {
  return { x: vect[0], y: vect[1] };
}

export const Time = {
  /** converts milliseconds to microseconds */
  us: (milliseconds: number) => milliseconds * 1000,
  /** converts microseconds to milliseconds */
  ms: (microseconds: number) => microseconds / 1000,
  /** converts  milliseconds to seconds */
  s: (milliseconds: number) => milliseconds / 1000,
};

export class SortedMap<T> {
  private map: Map<number, T>;
  private sortedKeys: number[];

  constructor() {
    this.map = new Map<number, T>();
    this.sortedKeys = [];
  }

  set(key: number, value: T): void {
    if (!this.map.has(key)) {
      this.sortedKeys.push(key);
      this.sortedKeys.sort((a, b) => a - b); // Maintain sorted order
    }
    this.map.set(key, value);
  }

  findNearest(targetKey: number): T | undefined {
    let index = binarySearch(this.sortedKeys, targetKey, (a, b) => a - b);
    let keyIndex = index < 0 ? Math.abs(index) - 2 : index;

    return this.map.get(this.sortedKeys[keyIndex]);
  }

  has(key: number) {
    return this.map.has(key);
  }

  clear() {
    this.map.clear();
    this.sortedKeys = [];
  }
}

/**
 * This will return true on the first call and false
 * when the args don't match the previous args
 * @param trueOnFirstCall
 * @returns
 */
export function createChangeTracker<T>(trueOnFirstCall = true) {
  let previousArgs: T[] | undefined = undefined;

  return function checkArgs(...args: T[]): boolean {
    if (!previousArgs) {
      previousArgs = args;
      return trueOnFirstCall;
    }

    // Check if args are equal to previous args
    // If args are equal to previous args, return false, otherwise update previous args and return true
    if (deepEqual(args, previousArgs)) {
      return false;
    } else {
      previousArgs = args;
      return true;
    }
  };
}
