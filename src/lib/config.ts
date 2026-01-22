/**
 * Configuration loader for Trace Anne
 *
 * Reads the YAML config file and provides typed access to settings.
 * This runs on the server only (uses Node.js fs module).
 */

import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { resolve } from 'path';

// TypeScript interface defining the shape of our config
export interface Config {
  dataPath: string;
  columns: {
    left: string;
    right: string;
  };
  labels: {
    left: string;
    right: string;
  };
  annotationColumn: string;
}

/**
 * Loads and parses the config.yaml file from project root
 */
export function loadConfig(): Config {
  const configPath = resolve(process.cwd(), 'config.yaml');
  const fileContents = readFileSync(configPath, 'utf-8');
  const config = parse(fileContents) as Config;
  return config;
}
