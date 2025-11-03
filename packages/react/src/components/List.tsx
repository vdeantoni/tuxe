/**
 * List.tsx - List component and descriptor for @unblessed/react
 *
 * Provides a scrollable, selectable list with keyboard and mouse support.
 */

import { List as ListWidget, type Screen } from "@unblessed/core";
import { ComputedLayout } from "@unblessed/layout";
import type { ReactNode } from "react";
import { forwardRef } from "react";
import type {
  InteractiveWidgetProps,
  StyleObject,
} from "../widget-descriptors/common-props.js";
import {
  buildFocusableOptions,
  buildStyleObject,
} from "../widget-descriptors/helpers.js";
import { BoxDescriptor, COMMON_WIDGET_OPTIONS } from "./Box";

/**
 * Props interface for List component
 * Provides a simplified, React-friendly API with sensible defaults
 *
 * Styling hierarchy:
 * - style, hover, focus: Affect the List container (borders, background)
 * - itemStyle, itemSelected, itemHover: Affect individual list items
 */
export interface ListProps extends InteractiveWidgetProps {
  // Items
  items: string[];
  children?: ReactNode;

  // label
  label: string;

  // Events
  onSelect?: (item: string, index: number) => void;
  onCancel?: () => void;

  // State
  defaultSelected?: number;

  // Behavior
  disabled?: boolean; // Maps to !interactive (more intuitive than interactive)
  vi?: boolean; // Vi keybindings (default: false)

  // Item state styling
  itemStyle?: StyleObject; // Normal item appearance
  itemSelected?: StyleObject; // Selected item appearance
  itemHover?: StyleObject; // Hovered item appearance

  // Scrollbar configuration
  scrollbar?: boolean; // Enable/disable scrollbar (default: enabled)
  scrollbarBg?: string; // Scrollbar background color
  scrollbarFg?: string; // Scrollbar foreground color
  scrollbarChar?: string; // Scrollbar character (default: ' ')
  scrollbarTrack?: boolean; // Show scrollbar track
  scrollbarTrackBg?: string; // Track background color
  scrollbarTrackFg?: string; // Track foreground color
  scrollbarTrackChar?: string; // Track character
}

/**
 * Descriptor for List widgets
 */
export class ListDescriptor extends BoxDescriptor<ListProps> {
  override readonly type = "list";

  override get widgetOptions() {
    const options = super.widgetOptions;

    // Build focusable options using helper function
    Object.assign(options, buildFocusableOptions(this.props, 0));

    // Items
    options.items = this.props.items || [];

    // label
    options.label = this.props.label;

    // React defaults (always enabled - users can't disable)
    options.mouse = true;
    options.keys = true;
    options.tags = true;
    options.inputOnFocus = true;

    // User-controlled behavior
    options.interactive = !this.props.disabled; // disabled is more intuitive
    options.vi = this.props.vi ?? false;

    // Build scrollbar configuration
    if (this.props.scrollbar !== false) {
      options.scrollbar = {
        ch: this.props.scrollbarChar || " ",
      };

      if (this.props.scrollbarFg) options.scrollbar.fg = this.props.scrollbarFg;
      if (this.props.scrollbarBg) options.scrollbar.bg = this.props.scrollbarBg;

      // Add track configuration if enabled
      if (this.props.scrollbarTrack) {
        options.scrollbar.track = {
          ch: this.props.scrollbarTrackChar,
        };
        if (this.props.scrollbarTrackFg)
          options.scrollbar.track.fg = this.props.scrollbarTrackFg;
        if (this.props.scrollbarTrackBg)
          options.scrollbar.track.bg = this.props.scrollbarTrackBg;
      }
    }

    // Selected item styling
    if (this.props.itemSelected) {
      const selectedStyle = buildStyleObject(this.props.itemSelected);
      if (selectedStyle.fg !== undefined) options.selectedFg = selectedStyle.fg;
      if (selectedStyle.bg !== undefined) options.selectedBg = selectedStyle.bg;
      if (selectedStyle.bold !== undefined)
        options.selectedBold = selectedStyle.bold;
      if (selectedStyle.underline !== undefined)
        options.selectedUnderline = selectedStyle.underline;
      if (selectedStyle.blink !== undefined)
        options.selectedBlink = selectedStyle.blink;
      if (selectedStyle.inverse !== undefined)
        options.selectedInverse = selectedStyle.reverse;
    }

    // Normal item styling
    if (this.props.itemStyle) {
      const itemStyleObj = buildStyleObject(this.props.itemStyle);
      if (itemStyleObj.fg !== undefined) options.itemFg = itemStyleObj.fg;
      if (itemStyleObj.bg !== undefined) options.itemBg = itemStyleObj.bg;
      if (itemStyleObj.bold !== undefined) options.itemBold = itemStyleObj.bold;
      if (itemStyleObj.underline !== undefined)
        options.itemUnderline = itemStyleObj.underline;
      if (itemStyleObj.blink !== undefined)
        options.itemBlink = itemStyleObj.blink;
      if (itemStyleObj.inverse !== undefined)
        options.itemInverse = itemStyleObj.reverse;
    }

    // Item hover styling
    if (this.props.itemHover) {
      const hoverStyle = buildStyleObject(this.props.itemHover);
      if (hoverStyle.bg !== undefined) options.itemHoverBg = hoverStyle.bg;
    }

    return options;
  }

  override get eventHandlers() {
    const handlers: Record<string, Function> = super.eventHandlers;

    // List-specific events
    if (this.props.onSelect) handlers.select = this.props.onSelect;
    if (this.props.onCancel) handlers.cancel = this.props.onCancel;

    return handlers;
  }

  override createWidget(layout: ComputedLayout, screen: Screen): ListWidget {
    return new ListWidget({
      screen,
      ...COMMON_WIDGET_OPTIONS,
      top: layout.top,
      left: layout.left,
      width: layout.width,
      height: layout.height,
      ...this.widgetOptions,
    });
  }

  override updateWidget(widget: ListWidget, layout: ComputedLayout): void {
    // Call base implementation for position and options update
    super.updateWidget(widget, layout);

    // List-specific: Update items array
    const newItems = this.widgetOptions.items || [];
    widget.setItems(newItems);
  }
}

/**
 * List component - Scrollable, selectable list with keyboard and mouse support
 *
 * Provides a simplified API with better defaults than raw unblessed List.
 * Mouse, keyboard, and tags are always enabled.
 *
 * Styling hierarchy:
 * - style, hover, focus: Affect the List container (borders, background)
 * - itemStyle, itemSelected, itemHover: Affect individual list items
 *
 * @example Basic list
 * ```tsx
 * <List
 *   items={['Apple', 'Banana', 'Cherry']}
 *   label="Choose a fruit"
 *   width={40}
 *   height={10}
 *   border={1}
 *   borderStyle="single"
 *   itemSelected={{ bg: "blue", color: "white" }}
 *   onSelect={(item, index) => console.log('Selected:', item)}
 * />
 * ```
 *
 * @example With list container and item styling
 * ```tsx
 * <List
 *   items={items}
 *   label="Select an option"
 *   border={1}
 *   borderStyle="single"
 *   borderColor="white"
 *   hover={{ border: { color: "cyan" } }}          // List border on hover
 *   focus={{ border: { color: "yellow" } }}        // List border on focus
 *   itemStyle={{ color: "gray" }}                  // Normal items
 *   itemSelected={{ bg: "white", color: "black", bold: true }}  // Selected item
 *   itemHover={{ bg: "darkgray" }}                 // Hovered item
 * />
 * ```
 *
 * @example Disabled list (read-only)
 * ```tsx
 * <List
 *   items={items}
 *   label="Read only"
 *   disabled={true}
 *   itemStyle={{ color: "gray" }}
 * />
 * ```
 */
export const List = forwardRef<any, ListProps>(({ ...props }, ref) => {
  return (
    <list
      ref={ref}
      border={1}
      minHeight={5}
      itemSelected={{ bg: "white", color: "black" }}
      {...props}
    />
  );
});

List.displayName = "List";
