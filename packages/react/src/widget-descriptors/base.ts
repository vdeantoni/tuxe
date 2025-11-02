/**
 * base.ts - Base class for widget descriptors
 *
 * This module defines the WidgetDescriptor base class that all widget types
 * extend. Each descriptor encapsulates:
 * - Typed props for the widget
 * - Flexbox property extraction
 * - Widget options extraction
 * - Event handler extraction
 * - Widget instance creation
 *
 * This eliminates the need for string-based type discrimination and large
 * switch statements throughout the codebase.
 */

import type { Element, Screen } from "@unblessed/core";
import type { ComputedLayout, FlexboxProps } from "@unblessed/layout";

/**
 * Base class for all widget descriptors.
 *
 * A WidgetDescriptor is responsible for:
 * 1. Storing typed props for a specific widget type
 * 2. Extracting flexbox-related props for Yoga layout
 * 3. Extracting widget-specific options for unblessed widgets
 * 4. Extracting event handlers for binding
 * 5. Creating the actual unblessed widget instance
 *
 * @template TProps - The typed props interface for this widget
 */
export abstract class WidgetDescriptor<TProps = any> {
  /**
   * Widget type identifier (e.g., 'box', 'text', 'button')
   */
  abstract readonly type: string;

  /**
   * Constructor stores the props
   * @param props - Typed props for this widget
   */
  constructor(public props: TProps) {}

  /**
   * Extract flexbox-related properties for Yoga layout engine.
   * Only include properties that affect layout (width, height, padding, etc.)
   *
   * @returns FlexboxProps for Yoga
   */
  abstract get flexProps(): FlexboxProps;

  /**
   * Extract widget-specific options for unblessed widget creation.
   * Include visual properties (border, content, style) but NOT layout properties.
   *
   * @returns Options object for unblessed widget constructor
   */
  abstract get widgetOptions(): Record<string, any>;

  /**
   * Extract event handlers from props.
   * Maps React-style event props (onClick, onKeyPress) to unblessed event names.
   *
   * @returns Map of event name → handler function
   */
  abstract get eventHandlers(): Record<string, Function>;

  /**
   * Create the actual unblessed widget instance.
   * Called after Yoga has calculated the layout.
   *
   * @param layout - Computed layout from Yoga (top, left, width, height)
   * @param screen - Screen instance to attach widget to
   * @returns Unblessed Element instance
   */
  abstract createWidget(layout: ComputedLayout, screen: Screen): Element;

  /**
   * Update an existing widget with new layout and options.
   * Called when React re-renders with changed props or layout changes.
   *
   * @param widget - Existing widget instance to update
   * @param layout - New computed layout from Yoga (with border adjustments already applied)
   */
  updateWidget(widget: Element, layout: ComputedLayout): void {
    // Update position
    // Note: layout already has border adjustments applied from widget-sync
    widget.position.top = layout.top;
    widget.position.left = layout.left;
    widget.position.width = layout.width;
    widget.position.height = layout.height;

    // Update widget options
    Object.assign(widget, this.widgetOptions);
  }

  /**
   * Update widget with new props.
   * Called when React re-renders with changed props.
   *
   * @param newProps - New props from React
   */
  updateProps(newProps: TProps): void {
    this.props = newProps;
  }
}
