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
import { ComputedLayout, FlexboxProps } from "./types";

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
   *
   * IMPORTANT: This method must preserve runtime hover/focus state.
   * When hover/focus effects are active, Screen.setEffects() modifies widget.style
   * and stores original values in temporary objects (_htemp, _ftemp).
   * We must not overwrite widget.style when effects are active.
   *
   * @param widget - Existing widget instance to update
   * @param layout - New computed layout from Yoga (with border adjustments already applied)
   */
  updateWidget(widget: Element, layout: ComputedLayout): void {
    // Update position
    widget.position.top = layout.top;
    widget.position.left = layout.left;
    widget.position.width = layout.width;
    widget.position.height = layout.height;

    // Get new widget options
    const options = this.widgetOptions;

    // Check if hover/focus effects are currently active
    const hoverTemp = (widget as any)._htemp;
    const focusTemp = (widget as any)._ftemp;
    const hasActiveEffects = hoverTemp || focusTemp;

    if (hasActiveEffects) {
      // Effects are active - preserve style, update everything else
      const { style, hoverEffects, focusEffects, ...otherOptions } = options;

      // Deep clone other options to avoid shared references
      const safeOptions = this.deepCloneOptions(otherOptions);
      Object.assign(widget, safeOptions);

      // Update the temp storage to reflect new base style values
      // This ensures when mouseout/blur happens, we restore to the NEW base
      if (hoverTemp && hoverEffects && style) {
        this.updateTempFromNewBase(hoverTemp, style, hoverEffects);
      }
      if (focusTemp && focusEffects && style) {
        this.updateTempFromNewBase(focusTemp, style, focusEffects);
      }
    } else {
      // No active effects - normal update with deep clone
      const safeOptions = this.deepCloneOptions(options);
      Object.assign(widget, safeOptions);
    }
  }

  /**
   * Update temporary storage with new base values while preserving effect state.
   * When props change during hover/focus, we need to update what values will be
   * restored on mouseout/blur, but keep the current hover/focus styling active.
   *
   * @param temp - Temporary storage object (_htemp or _ftemp)
   * @param newBaseStyle - New base style from props
   * @param effects - Effects configuration (hoverEffects or focusEffects)
   */
  private updateTempFromNewBase(
    temp: any,
    newBaseStyle: any,
    effects: any,
  ): void {
    Object.keys(effects).forEach((key) => {
      const effectVal = effects[key];
      if (effectVal !== null && typeof effectVal === "object") {
        // Nested object like border
        temp[key] = temp[key] || {};
        const newBase = newBaseStyle[key] || {};
        Object.keys(effectVal).forEach((k) => {
          // Update temp to store the new base value
          // When mouseout/blur occurs, this is what will be restored
          temp[key][k] = newBase[k];
        });
      } else {
        // Simple property like fg, bg
        temp[key] = newBaseStyle[key];
      }
    });
  }

  /**
   * Deep clone options to avoid mutating shared object references.
   *
   * @param options - Options object to clone
   * @returns Deep cloned options object
   */
  private deepCloneOptions(options: any): any {
    if (!options || typeof options !== "object") {
      return options;
    }

    const cloned: any = {};

    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        const val = options[key];

        if (val !== null && typeof val === "object" && !Array.isArray(val)) {
          // Recursively clone nested objects
          cloned[key] = this.deepCloneOptions(val);
        } else {
          cloned[key] = val;
        }
      }
    }

    return cloned;
  }
}
