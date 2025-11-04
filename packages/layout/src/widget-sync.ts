/**
 * widget-sync.ts - Synchronize Yoga layout to unblessed widgets
 */

import { Box, Element, Screen } from "@unblessed/core";
import Yoga from "yoga-layout";
import type { ComputedLayout, LayoutNode } from "./types.js";

/**
 * Binds event handlers to a widget.
 */
function bindEventHandlers(
  widget: Element,
  handlers: Record<string, Function>,
): void {
  for (const [event, handler] of Object.entries(handlers)) {
    widget.on(event, handler as any);
  }
}

/**
 * Unbinds event handlers from a widget.
 */
function unbindEventHandlers(
  widget: Element,
  handlers: Record<string, Function>,
): void {
  for (const [event, handler] of Object.entries(handlers)) {
    widget.removeListener(event, handler as any);
  }
}

/**
 * Extracts computed layout from a Yoga node.
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
 * Yoga positions are applied to widgets. Widgets are created/updated as needed.
 */
export function syncWidgetWithYoga(node: LayoutNode, screen: Screen): Element {
  // Extract Yoga's computed layout
  const layout = getComputedLayout(node);

  let top = layout.top;
  let left = layout.left;

  if (node.parent) {
    const parentBorderTop = node.parent.yogaNode.getComputedBorder(
      Yoga.EDGE_TOP,
    );
    const parentBorderLeft = node.parent.yogaNode.getComputedBorder(
      Yoga.EDGE_LEFT,
    );

    // Adjust for border collapse difference between Yoga and unblessed
    top = layout.top - parentBorderTop;
    left = layout.left - parentBorderLeft;
  }

  // Text nodes return hidden elements; content is set on parent after syncing children
  if (node.type === "#text") {
    if (node.widget) {
      return node.widget;
    }
    node.widget = new Element({ screen, hidden: true });
    return node.widget;
  }

  if (!node.widget) {
    // First render - create new widget
    if (node._descriptor) {
      // Use descriptor if available (from React)
      const adjustedLayout = { ...layout, top, left };
      node.widget = node._descriptor.createWidget(adjustedLayout, screen);
    } else {
      // Fallback: create a simple Box widget (for standalone layout usage)
      node.widget = new Box({
        screen,
        tags: true,
        mouse: true,
        keys: true,
        top,
        left,
        width: layout.width,
        height: layout.height,
        ...node.widgetOptions,
      });
    }

    // Bind event handlers after widget is created
    // TypeScript can't infer widget is non-null here, so we assert it
    if (node.eventHandlers && Object.keys(node.eventHandlers).length > 0) {
      bindEventHandlers(node.widget!, node.eventHandlers);
      node._boundHandlers = node.eventHandlers;
    }
  } else {
    // Update existing widget
    const adjustedLayout = { ...layout, top, left };

    if (node._descriptor) {
      // Use descriptor's update method (from React)
      node._descriptor.updateWidget(node.widget, adjustedLayout);
    } else {
      // Fallback: manually update (for standalone layout usage)
      node.widget.position.top = top;
      node.widget.position.left = left;
      node.widget.position.width = layout.width;
      node.widget.position.height = layout.height;

      if (node.widgetOptions) {
        Object.assign(node.widget, node.widgetOptions);
      }
    }

    // Update event handlers
    if (node.eventHandlers !== node._boundHandlers) {
      if (node._boundHandlers) {
        unbindEventHandlers(node.widget, node._boundHandlers);
      }

      if (Object.keys(node.eventHandlers || {}).length > 0) {
        bindEventHandlers(node.widget, node.eventHandlers || {});
        node._boundHandlers = node.eventHandlers;
      } else {
        node._boundHandlers = undefined;
      }
    }
  }

  // At this point, node.widget is guaranteed to be defined (either just created or already existed)
  // TypeScript can't infer this, so we use non-null assertion
  const widget = node.widget!;

  for (const child of node.children) {
    const childWidget = syncWidgetWithYoga(child, screen);

    if (childWidget.parent !== widget) {
      widget.append(childWidget);
    }
  }

  // Concatenate all #text children and set as widget content
  if (node.children.length > 0) {
    const allTextNodes = node.children.every((c) => c.type === "#text");

    if (allTextNodes) {
      const fullContent = node.children
        .map((c) => c.widgetOptions?.content || "")
        .join("");

      if (fullContent) {
        widget.setContent(fullContent);
      }
    }
  }

  return widget;
}

/**
 * Synchronizes layout tree to widgets and renders to screen.
 */
export function syncTreeAndRender(rootNode: LayoutNode, screen: Screen): void {
  const rootWidget = syncWidgetWithYoga(rootNode, screen);

  // Attach root widget to screen if not already attached
  if (!rootWidget.parent) {
    screen.append(rootWidget);
  }

  screen.render();
}

/**
 * Destroys all widgets in a layout tree and unbinds event handlers.
 */
export function destroyWidgets(node: LayoutNode): void {
  for (const child of node.children) {
    destroyWidgets(child);
  }

  if (node.widget) {
    if (node._boundHandlers) {
      unbindEventHandlers(node.widget, node._boundHandlers);
      node._boundHandlers = undefined;
    }

    node.widget.detach();
    node.widget.destroy();
    node.widget = undefined;
  }
}
