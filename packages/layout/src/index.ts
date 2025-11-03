/**
 * @unblessed/layout - Flexbox layout engine for unblessed
 *
 * This package provides a bridge between Facebook's Yoga layout engine
 * and unblessed widgets, enabling flexbox-style layouts in terminal UIs.
 *
 * @example Basic usage
 * ```typescript
 * import { Screen } from '@unblessed/node';
 * import { LayoutManager } from '@unblessed/layout';
 *
 * const screen = new Screen();
 * const manager = new LayoutManager({ screen });
 *
 * // Create layout tree
 * const container = manager.createNode('container', {
 *   flexDirection: 'row',
 *   gap: 2,
 *   padding: 1
 * });
 *
 * const left = manager.createNode('left', { width: 20, height: 5 }, {
 *   content: 'Left',
 *   border: { type: 'line' }
 * });
 *
 * const spacer = manager.createNode('spacer', { flexGrow: 1 });
 *
 * const right = manager.createNode('right', { width: 20, height: 5 }, {
 *   content: 'Right',
 *   border: { type: 'line' }
 * });
 *
 * manager.appendChild(container, left);
 * manager.appendChild(container, spacer);
 * manager.appendChild(container, right);
 *
 * // Calculate layout and render
 * manager.performLayout(container);
 * ```
 *
 * @packageDocumentation
 */

export { LayoutManager } from "./layout-engine.js";
export type {
  ComputedLayout,
  FlexboxProps,
  LayoutManagerOptions,
  LayoutNode,
} from "./types.js";
export { WidgetDescriptor } from "./widget-descriptor.js";
export {
  destroyWidgets,
  getComputedLayout,
  syncTreeAndRender,
  syncWidgetWithYoga,
} from "./widget-sync.js";
export {
  appendChild,
  applyFlexStyles,
  createLayoutNode,
  destroyLayoutNode,
  removeChild,
  updateLayoutNode,
} from "./yoga-node.js";
