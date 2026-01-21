/**
 * JSONL data utilities for Trace Anne
 *
 * Handles reading and writing JSONL (JSON Lines) files.
 * Each line in the file is a separate JSON object.
 *
 * This runs on the server only (uses Node.js fs module).
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// A single row from the JSONL file
// Using Record<string, string> since column names are configurable
export type DataRow = Record<string, string>;

/**
 * Reads a JSONL file and returns an array of objects
 *
 * JSONL format: each line is a valid JSON object
 * Example:
 *   {"input": "hello", "output": "hi"}
 *   {"input": "bye", "output": "goodbye"}
 */
export function readJsonl(filePath: string): DataRow[] {
  const absolutePath = resolve(process.cwd(), filePath);
  const fileContents = readFileSync(absolutePath, 'utf-8');

  // Split by newlines, filter empty lines, parse each as JSON
  const rows = fileContents
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => JSON.parse(line) as DataRow);

  return rows;
}

/**
 * Writes an array of objects back to a JSONL file
 *
 * Each object becomes one line of JSON
 */
export function writeJsonl(filePath: string, rows: DataRow[]): void {
  const absolutePath = resolve(process.cwd(), filePath);

  // Convert each row to JSON, join with newlines
  const content = rows
    .map(row => JSON.stringify(row))
    .join('\n');

  writeFileSync(absolutePath, content + '\n', 'utf-8');
}
