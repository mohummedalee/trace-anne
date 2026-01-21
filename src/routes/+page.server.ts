/**
 * Server-side data loading and form handling for the main page
 *
 * In SvelteKit, +page.server.ts files run ONLY on the server.
 * This is where we do file I/O since browsers can't access the filesystem.
 *
 * Two main exports:
 * - load(): Runs before the page renders, provides data to the page
 * - actions: Handles form submissions (like saving annotations)
 */

import type { PageServerLoad, Actions } from './$types';
import { loadConfig } from '$lib/config';
import { readJsonl, writeJsonl } from '$lib/data';

/**
 * Load function - runs on every page request
 *
 * Returns data that becomes available in the page component
 * via the `data` prop.
 */
export const load: PageServerLoad = async () => {
  const config = loadConfig();
  const rows = readJsonl(config.dataPath);

  return {
    config,
    rows
  };
};

/**
 * Form actions - handle POST requests from forms
 *
 * The 'save' action is triggered when the annotation form is submitted.
 * We update the specific row and write the entire file back.
 */
export const actions: Actions = {
  save: async ({ request }) => {
    const formData = await request.formData();
    const index = parseInt(formData.get('index') as string, 10);
    const annotation = formData.get('annotation') as string;

    const config = loadConfig();
    const rows = readJsonl(config.dataPath);

    // Update the annotation for the specified row
    rows[index][config.annotationColumn] = annotation;

    // Write all rows back to the file
    writeJsonl(config.dataPath, rows);

    return { success: true };
  }
};
