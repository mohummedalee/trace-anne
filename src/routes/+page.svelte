<!--
  Main annotation page component

  This is a Svelte 5 component using runes ($state, $derived) for reactivity.
  Data comes from +page.server.ts via the `data` prop.
-->

<script lang="ts">
  import { diffWords } from 'diff';

  // Props - data from the server load function
  // In Svelte 5, we use $props() rune to declare props
  let { data } = $props();

  // Reactive state using $state rune
  // These values will trigger UI updates when changed
  let currentIndex = $state(0);
  let diffMode = $state(false);
  let annotation = $state(data.rows[0]?.[data.config.annotationColumn] ?? '');

  // Derived values using $derived rune
  // These automatically recalculate when dependencies change
  let currentRow = $derived(data.rows[currentIndex]);
  let leftContent = $derived(currentRow?.[data.config.columns.left] ?? '');
  let rightContent = $derived(currentRow?.[data.config.columns.right] ?? '');
  let totalRows = $derived(data.rows.length);
  let canGoBack = $derived(currentIndex > 0);
  let canGoNext = $derived(currentIndex < totalRows - 1);

  // Save current annotation to server
  async function saveAnnotation() {
    // Skip if annotation is empty
    if (!annotation.trim()) return;

    const formData = new FormData();
    formData.set('index', currentIndex.toString());
    formData.set('annotation', annotation);

    // Update local data so navigating back shows the saved value
    data.rows[currentIndex][data.config.annotationColumn] = annotation;

    await fetch('?/save', {
      method: 'POST',
      body: formData
    });
  }

  // Navigation functions (auto-save before navigating)
  async function goBack() {
    if (canGoBack) {
      await saveAnnotation();
      currentIndex--;
      annotation = data.rows[currentIndex]?.[data.config.annotationColumn] ?? '';
    }
  }

  async function goNext() {
    if (canGoNext) {
      await saveAnnotation();
      currentIndex++;
      annotation = data.rows[currentIndex]?.[data.config.annotationColumn] ?? '';
    }
  }

  /**
   * Compute diff between left and right content
   * Returns HTML string with additions/deletions highlighted
   */
  function computeDiff(left: string, right: string): string {
    const changes = diffWords(left, right);

    return changes
      .map(part => {
        if (part.added) {
          return `<span class="diff-added">${escapeHtml(part.value)}</span>`;
        }
        if (part.removed) {
          return `<span class="diff-removed">${escapeHtml(part.value)}</span>`;
        }
        return escapeHtml(part.value);
      })
      .join('');
  }

  // Escape HTML to prevent XSS when using @html
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  }

  // Format text for display (convert newlines to <br>)
  function formatText(text: string): string {
    return escapeHtml(text);
  }
</script>

<!--
  Styles are scoped to this component by default.
  They won't leak to other components.
-->
<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
  }

  /* Top navigation bar */
  .nav-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }

  .nav-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .nav-btn {
    padding: 0.75rem 2rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    border-radius: 4px;
  }

  .nav-btn:hover:not(:disabled) {
    background: #e0e0e0;
  }

  .nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nav-info {
    font-size: 1rem;
    color: #666;
  }

  .diff-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .diff-toggle label {
    cursor: pointer;
  }

  /* Comparison columns - 70% of screen */
  .comparison {
    display: flex;
    flex: 7;
    min-height: 0;
  }

  .column {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    border-right: 1px solid #ddd;
  }

  .column:last-child {
    border-right: none;
  }

  .column-header {
    font-weight: bold;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #333;
    text-transform: capitalize;
  }

  .column-content {
    line-height: 1.6;
    white-space: pre-wrap;
  }

  /* Diff highlighting */
  :global(.diff-added) {
    background-color: #d4edda;
    color: #155724;
  }

  :global(.diff-removed) {
    background-color: #f8d7da;
    color: #721c24;
    text-decoration: line-through;
  }

  /* Annotation area - 30% of screen */
  .annotation-area {
    flex: 3;
    padding: 1rem;
    background: #fafafa;
    border-top: 2px solid #ddd;
    display: flex;
    flex-direction: column;
  }

  .annotation-area h3 {
    margin: 0 0 0.5rem 0;
  }

  .annotation-form {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 0.5rem;
  }

  .annotation-input {
    flex: 1;
    padding: 0.75rem;
    font-size: 1rem;
    font-family: inherit;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: none;
  }

  .save-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    align-self: flex-start;
  }

  .save-btn:hover {
    background: #0056b3;
  }
</style>

<div class="container">
  <!-- Navigation bar -->
  <nav class="nav-bar">
    <div class="nav-buttons">
      <button class="nav-btn" onclick={goBack} disabled={!canGoBack}>
        ← Back
      </button>
      <button class="nav-btn" onclick={goNext} disabled={!canGoNext}>
        Next →
      </button>
    </div>

    <span class="nav-info">
      {currentIndex + 1} of {totalRows}
    </span>

    <div class="diff-toggle">
      <input
        type="checkbox"
        id="diffMode"
        bind:checked={diffMode}
      />
      <label for="diffMode">Diff Mode</label>
    </div>
  </nav>

  <!-- Two-column comparison view -->
  <div class="comparison">
    <div class="column">
      <div class="column-header">{data.config.labels.left}</div>
      <div class="column-content">
        {@html formatText(leftContent)}
      </div>
    </div>

    <div class="column">
      <div class="column-header">{data.config.labels.right}</div>
      <div class="column-content">
        {#if diffMode}
          {@html computeDiff(leftContent, rightContent)}
        {:else}
          {@html formatText(rightContent)}
        {/if}
      </div>
    </div>
  </div>

  <!-- Annotation input area -->
  <div class="annotation-area">
    <h3>Annotation</h3>
    <form class="annotation-form" method="POST" action="?/save">
      <input type="hidden" name="index" value={currentIndex} />
      <textarea
        class="annotation-input"
        name="annotation"
        bind:value={annotation}
        placeholder="Add your annotation here..."
      ></textarea>
      <button type="submit" class="save-btn">Save Annotation</button>
    </form>
  </div>
</div>
