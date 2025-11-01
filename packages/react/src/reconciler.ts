/**
 * reconciler.ts - React reconciler for @unblessed/react
 *
 * This module configures the React reconciler to work with our virtual DOM
 * and @unblessed/layout's LayoutManager.
 *
 * Key differences from Ink:
 * - We use LayoutManager from @unblessed/layout (don't create Yoga nodes directly)
 * - Simpler DOM structure (no text wrapping, measure functions here)
 * - Layout calculation delegated to LayoutManager
 */

import { colors } from "@unblessed/core";
import type { FlexboxProps } from "@unblessed/layout";
import { LayoutManager, updateLayoutNode } from "@unblessed/layout";
import createReconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants.js";
import {
  appendChild,
  createElement,
  createTextNode,
  type DOMNode,
  type ElementType,
  insertBefore,
  removeChild,
  type TextNode,
  updateNodeProps,
} from "./dom.js";

type Props = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type HostContext = {};

let currentLayoutManager: LayoutManager | null = null;

/**
 * Set the layout manager for the current render
 * Called by render.ts
 */
export function setLayoutManager(manager: LayoutManager): void {
  currentLayoutManager = manager;
}

/**
 * Get the current layout manager
 */
function getLayoutManager(): LayoutManager {
  if (!currentLayoutManager) {
    throw new Error(
      "LayoutManager not set - this is a bug in @unblessed/react",
    );
  }
  return currentLayoutManager;
}

/**
 * Converts React props to Flexbox props for LayoutManager
 */
function propsToFlexbox(props: Props): FlexboxProps {
  // Extract flexbox properties from React props
  const flexboxProps: FlexboxProps = {};

  // Copy all flexbox-related props
  const flexKeys: (keyof FlexboxProps)[] = [
    "flexGrow",
    "flexShrink",
    "flexBasis",
    "flexDirection",
    "flexWrap",
    "justifyContent",
    "alignItems",
    "alignSelf",
    "width",
    "height",
    "minWidth",
    "minHeight",
    "maxWidth",
    "maxHeight",
    "padding",
    "paddingX",
    "paddingY",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "border",
    "borderTop",
    "borderBottom",
    "borderLeft",
    "borderRight",
    "margin",
    "marginX",
    "marginY",
    "marginTop",
    "marginBottom",
    "marginLeft",
    "marginRight",
    "gap",
    "rowGap",
    "columnGap",
    "position",
    "display",
  ];

  for (const key of flexKeys) {
    if (key in props) {
      (flexboxProps as any)[key] = props[key];
    }
  }

  return flexboxProps;
}

/**
 * Converts React props to widget options (content, border, style, etc.)
 */
function propsToWidgetOptions(props: Props): any {
  const widgetOptions: any = {};

  // Border handling - build border object comprehensively
  if (
    Number(props.border) > 0 ||
    Number(props.borderTop) > 0 ||
    Number(props.borderBottom) > 0 ||
    Number(props.borderLeft) > 0 ||
    Number(props.borderRight) > 0
  ) {
    const border: any = {
      type: "line",
      style: props.borderStyle || "single",
    };

    // Per-side visibility (from FlexboxProps border/borderTop/etc numbers)
    // If borderTop/Bottom/Left/Right are set in flexbox props, show those sides
    // Default to showing all sides if borderStyle is set
    border.top =
      props.borderTop !== undefined ? Number(props.borderTop) > 0 : true;
    border.bottom =
      props.borderBottom !== undefined ? Number(props.borderBottom) > 0 : true;
    border.left =
      props.borderLeft !== undefined ? Number(props.borderLeft) > 0 : true;
    border.right =
      props.borderRight !== undefined ? Number(props.borderRight) > 0 : true;

    // Border color (global or per-side)
    if (props.borderColor) {
      border.fg = colors.convert(props.borderColor as string);
    }

    // Per-side border colors
    if (props.borderTopColor) {
      border.topColor = colors.convert(props.borderTopColor as string);
    }
    if (props.borderBottomColor) {
      border.bottomColor = colors.convert(props.borderBottomColor as string);
    }
    if (props.borderLeftColor) {
      border.leftColor = colors.convert(props.borderLeftColor as string);
    }
    if (props.borderRightColor) {
      border.rightColor = colors.convert(props.borderRightColor as string);
    }

    // Border dim (global or per-side)
    if (props.borderDimColor !== undefined) {
      border.dim = props.borderDimColor;
    }

    const borderDimMap = [
      ["borderTopDim", "borderTopDim"],
      ["borderBottomDim", "borderBottomDim"],
      ["borderLeftDim", "borderLeftDim"],
      ["borderRightDim", "borderRightDim"],
    ] as const;

    for (const [propKey, borderKey] of borderDimMap) {
      if (props[propKey] !== undefined) {
        border[borderKey] = props[propKey];
      }
    }

    widgetOptions.border = border;
  }

  // Colors - convert to numbers
  // For Box: Only set style.border colors (border uses style.border.fg)
  // For Text: Set style.fg/bg for text color
  if (props.color || props.backgroundColor) {
    widgetOptions.style = widgetOptions.style || {};

    // Set text colors (will be filtered out for Box widgets in widget-sync)
    if (props.color) {
      widgetOptions.style.fg = colors.convert(props.color as string);
    }
    if (props.backgroundColor) {
      widgetOptions.style.bg = colors.convert(props.backgroundColor as string);
    }
  }

  // Ensure style.border exists and has border colors
  // unblessed reads colors from style.border.fg, not border.fg
  if (widgetOptions.border) {
    widgetOptions.style = widgetOptions.style || {};
    widgetOptions.style.border = widgetOptions.style.border || {};

    // Copy border.fg to style.border.fg (this is where unblessed reads it from)
    if (widgetOptions.border.fg !== undefined) {
      widgetOptions.style.border.fg = widgetOptions.border.fg;
    }
  }

  // Tags
  if (props.tags !== undefined) {
    widgetOptions.tags = props.tags;
  }

  return widgetOptions;
}

const reconciler = createReconciler<
  ElementType,
  Props,
  DOMNode,
  DOMNode,
  TextNode,
  DOMNode,
  unknown,
  unknown,
  HostContext,
  unknown,
  unknown,
  unknown,
  unknown
>({
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: true,

  getRootHostContext() {
    return {};
  },

  getChildHostContext() {
    return {};
  },

  // Node creation
  createInstance(type, props) {
    const manager = getLayoutManager();

    // Create layout node via LayoutManager
    const flexboxProps = propsToFlexbox(props);
    const widgetOptions = propsToWidgetOptions(props);
    const layoutNode = manager.createNode(type, flexboxProps, widgetOptions);

    // Wrap in DOM node
    return createElement(type, layoutNode, props);
  },

  createTextInstance(text) {
    const manager = getLayoutManager();

    // Create layout node for text
    const layoutNode = manager.createNode(
      "#text",
      { height: 1, width: text.length },
      { content: text, tags: true },
    );

    return createTextNode(text, layoutNode, {});
  },

  // Tree manipulation
  appendInitialChild(parent, child) {
    appendChild(parent, child);

    // Also update layout tree
    const manager = getLayoutManager();
    manager.appendChild(parent.layoutNode, child.layoutNode);
  },

  appendChild(parent, child) {
    appendChild(parent, child);

    // Also update layout tree
    const manager = getLayoutManager();
    manager.appendChild(parent.layoutNode, child.layoutNode);
  },

  insertBefore(parent, child, beforeChild) {
    insertBefore(parent, child, beforeChild);

    // Also update layout tree
    const manager = getLayoutManager();
    manager.insertBefore(
      parent.layoutNode,
      child.layoutNode,
      beforeChild.layoutNode,
    );
  },

  removeChild(parent, child) {
    removeChild(parent, child);

    // Also update layout tree
    const manager = getLayoutManager();
    manager.removeChild(parent.layoutNode, child.layoutNode);
  },

  removeChildFromContainer(container, child) {
    if (container.childNodes.includes(child)) {
      removeChild(container, child);

      const manager = getLayoutManager();
      manager.removeChild(container.layoutNode, child.layoutNode);
    }
  },

  appendChildToContainer(container, child) {
    appendChild(container, child);

    const manager = getLayoutManager();
    manager.appendChild(container.layoutNode, child.layoutNode);
  },

  insertInContainerBefore(container, child, beforeChild) {
    insertBefore(container, child, beforeChild);

    const manager = getLayoutManager();
    manager.insertBefore(
      container.layoutNode,
      child.layoutNode,
      beforeChild.layoutNode,
    );
  },

  // Updates
  commitUpdate(instance, _updatePayload, _type, _oldProps, newProps) {
    // Update DOM node props
    updateNodeProps(instance, newProps);

    // Update layout node
    const flexboxProps = propsToFlexbox(newProps);
    const widgetOptions = propsToWidgetOptions(newProps);

    updateLayoutNode(instance.layoutNode, flexboxProps);
    instance.layoutNode.widgetOptions = widgetOptions;
  },

  commitTextUpdate(textInstance, _oldText, newText) {
    textInstance.nodeValue = newText;
    textInstance.layoutNode.widgetOptions = { content: newText };
  },

  // Commit hooks
  prepareForCommit: () => null,
  resetAfterCommit(rootNode) {
    // Trigger layout calculation and rendering
    // This is called after React commits all changes
    if (rootNode.onComputeLayout) {
      rootNode.onComputeLayout();
    }
  },

  preparePortalMount: () => null,
  clearContainer: () => false,

  // Instance management
  getPublicInstance: (instance) => instance,
  finalizeInitialChildren: () => false,
  shouldSetTextContent: () => false,

  // Visibility
  hideInstance(instance) {
    instance.layoutNode.props.display = "none";
    instance.layoutNode.yogaNode.setDisplay(1); // Yoga.DISPLAY_NONE
  },

  unhideInstance(instance) {
    instance.layoutNode.props.display = "flex";
    instance.layoutNode.yogaNode.setDisplay(0); // Yoga.DISPLAY_FLEX
  },

  hideTextInstance(instance) {
    instance.nodeValue = "";
    instance.layoutNode.widgetOptions = { content: "" };
  },

  unhideTextInstance(instance, text) {
    instance.nodeValue = text;
    instance.layoutNode.widgetOptions = { content: text };
  },

  // Reset methods
  resetTextContent: () => {},

  // Scheduling
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  getCurrentEventPriority: () => DefaultEventPriority,

  // Update priority
  // @ts-expect-error
  setCurrentUpdatePriority: () => {},

  // Scope (unused)
  getInstanceFromNode: () => null,
  prepareScopeUpdate: () => {},
  getInstanceFromScope: () => null,

  // Deletion
  detachDeletedInstance: () => {},

  // Active instance (unused)
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
});

export default reconciler;
