/**
 * widget-sync.ts - Synchronize Yoga layout to unblessed widgets
 */

import { BigText, Box, Element, Screen, Text } from "@unblessed/core";
import Yoga from "yoga-layout";
import type { ComputedLayout, LayoutNode } from "./types.js";

/**
 * Extracts computed layout from a Yoga node.
 * @param node - Layout node with computed Yoga layout
 * @returns Computed layout coordinates
 */
export function getComputedLayout(node: LayoutNode): ComputedLayout {
  return {
    top: Math.round(node.yogaNode.getComputedTop()),
    left: Math.round(node.yogaNode.getComputedLeft()),
    width: Math.round(node.yogaNode.getComputedWidth()),
    height: Math.round(node.yogaNode.getComputedHeight()),
  };
}

/**
 * Synchronizes a layout node tree to unblessed widgets.
 * This is where Yoga's calculated positions get applied to widgets.
 *
 * KEY PRINCIPLE: Yoga is ALWAYS the source of truth.
 * Widget positions are OVERWRITTEN every time this is called.
 *
 * @param node - Root layout node (with computed layout)
 * @param screen - Screen to attach widgets to
 * @returns The created/updated unblessed widget
 */
export function syncWidgetWithYoga(node: LayoutNode, screen: Screen): Element {
  // Extract Yoga's computed layout
  const layout = getComputedLayout(node);

  let top = layout.top;
  let left = layout.left;

  if (node.parent) {
    // Get parent's border from Yoga
    const parentBorderTop = node.parent.yogaNode.getComputedBorder(
      Yoga.EDGE_TOP,
    );
    const parentBorderLeft = node.parent.yogaNode.getComputedBorder(
      Yoga.EDGE_LEFT,
    );

    // yoga and unblessed treat border differently, unblessed collapse border
    top = layout.top - parentBorderTop;
    left = layout.left - parentBorderLeft;
  }

  // Text nodes are handled differently, we get is children/content and set it as content of the parent.
  if (node.type === "#text") {
    if (node.parent?.widget) {
      node.parent.widget.setContent(node.widgetOptions?.content);
      return new Element({ screen, hidden: true });
    }
  }

  // Create or update widget
  if (!node.widget) {
    // First render - create new widget
    let WidgetClass = Box;
    switch (node.type) {
      case "text": {
        WidgetClass = Text;
        break;
      }
      case "bigtext": {
        WidgetClass = BigText;
        break;
      }
    }

    node.widget = new WidgetClass({
      screen,
      top: top,
      left: left,
      width: layout.width,
      height: layout.height,
      ...node.widgetOptions, // Merge any additional widget options
    });
  } else {
    // Update existing widget with new layout
    // IMPORTANT: We OVERWRITE position every render
    // This ensures Yoga is always source of truth
    node.widget.position.top = top;
    node.widget.position.left = left;
    node.widget.position.width = layout.width;
    node.widget.position.height = layout.height;

    // Update other widget options if changed
    if (node.widgetOptions) {
      Object.assign(node.widget, node.widgetOptions);
    }
  }

  // Recursively sync children
  for (const child of node.children) {
    const childWidget = syncWidgetWithYoga(child, screen);

    // Ensure proper parent-child relationship
    if (childWidget.parent !== node.widget) {
      node.widget.append(childWidget);
    }
  }

  return node.widget;
}

/**
 * Synchronizes an entire layout tree to widgets and renders.
 * @param rootNode - Root layout node
 * @param screen - Screen to render to
 */
export function syncTreeAndRender(rootNode: LayoutNode, screen: Screen): void {
  // Sync the entire tree
  const rootWidget = syncWidgetWithYoga(rootNode, screen);

  // Ensure root widget is attached to screen
  if (!rootWidget.parent) {
    screen.append(rootWidget);
  }

  // Render the screen
  screen.render();
}

/**
 * Detaches and destroys all widgets in a layout node tree.
 * Useful for cleanup when unmounting.
 * @param node - Root layout node to clean up
 */
export function destroyWidgets(node: LayoutNode): void {
  // Recursively destroy children first
  for (const child of node.children) {
    destroyWidgets(child);
  }

  // Destroy this node's widget
  if (node.widget) {
    node.widget.detach();
    node.widget.destroy();
    node.widget = undefined;
  }
}
