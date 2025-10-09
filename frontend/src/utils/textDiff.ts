import type { Operation } from '../model/types';

/**
 * Calculate operations (diff) between old and new text
 * Returns operations that transform oldText into newText
 */
export function calculateOperations(oldText: string, newText: string): Operation[] {
  const ops: Operation[] = [];

  // Simple case: texts are identical
  if (oldText === newText) {
    return ops;
  }

  // Find common prefix
  let prefixLen = 0;
  const minLen = Math.min(oldText.length, newText.length);
  while (prefixLen < minLen && oldText[prefixLen] === newText[prefixLen]) {
    prefixLen++;
  }

  // Find common suffix
  let suffixLen = 0;
  while (
    suffixLen < minLen - prefixLen &&
    oldText[oldText.length - 1 - suffixLen] === newText[newText.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  // Retain prefix if any
  if (prefixLen > 0) {
    ops.push({
      type: 'retain',
      pos: 0,
      length: prefixLen,
    });
  }

  // Calculate changed portion
  const oldMiddle = oldText.substring(prefixLen, oldText.length - suffixLen);
  const newMiddle = newText.substring(prefixLen, newText.length - suffixLen);

  // Delete old middle if exists
  if (oldMiddle.length > 0) {
    ops.push({
      type: 'delete',
      pos: prefixLen,
      length: oldMiddle.length,
    });
  }

  // Insert new middle if exists
  if (newMiddle.length > 0) {
    ops.push({
      type: 'insert',
      pos: prefixLen,
      text: newMiddle,
    });
  }

  // No need to retain suffix (implicit)

  return ops;
}

/**
 * Apply operations to text
 */
export function applyOperations(text: string, ops: Operation[]): string {
  let result = text;
  let offset = 0;

  for (const op of ops) {
    switch (op.type) {
      case 'retain':
        // Skip this portion
        offset += op.length || 0;
        break;

      case 'insert':
        // Insert text at position
        const insertPos = op.pos + offset;
        result = result.slice(0, insertPos) + (op.text || '') + result.slice(insertPos);
        offset += (op.text || '').length;
        break;

      case 'delete':
        // Delete text at position
        const deletePos = op.pos + offset;
        result = result.slice(0, deletePos) + result.slice(deletePos + (op.length || 0));
        offset -= op.length || 0;
        break;
    }
  }

  return result;
}

