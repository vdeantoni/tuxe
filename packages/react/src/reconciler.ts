/**
 * reconciler.ts - React reconciler for @unblessed/react
 *
 * This module configures the React reconciler to work with our virtual DOM
 * and @unblessed/layout's LayoutManager.
 *
 * Key differences from Ink:
 * - We use LayoutManager from @unblessed/layout (don't create Yoga nodes directly)
 * - Widget descriptors encapsulate all widget configuration logic
 * - Layout calculation delegated to LayoutManager
 */

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
import { getCurrentTheme } from "./theme-registry.js";
import { createDescriptor } from "./widget-descriptors";

type Props = Record<string, unknown>;

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
    const theme = getCurrentTheme();

    // Create descriptor for this widget type with its props and theme
    const descriptor = createDescriptor(type, props, theme);

    // Create LayoutNode using descriptor's extracted properties
    const layoutNode = manager.createNode(
      type,
      descriptor.flexProps,
      descriptor.widgetOptions,
    );

    // Store descriptor and event handlers on the layout node
    layoutNode._descriptor = descriptor;
    layoutNode.eventHandlers = descriptor.eventHandlers;

    return createElement(type, layoutNode, props);
  },

  createTextInstance(text) {
    const manager = getLayoutManager();

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
  prepareUpdate() {
    // Return non-null to indicate update is needed
    // The actual update happens in commitUpdate
    return true;
  },

  commitUpdate(instance, _updatePayload, type, _oldProps, newProps) {
    updateNodeProps(instance, newProps);

    const theme = getCurrentTheme();

    // Create/update descriptor with new props and theme
    const descriptor = createDescriptor(type, newProps, theme);

    // Update layout node with new descriptor properties
    updateLayoutNode(instance.layoutNode, descriptor.flexProps);
    instance.layoutNode.widgetOptions = descriptor.widgetOptions;
    instance.layoutNode.eventHandlers = descriptor.eventHandlers;
    instance.layoutNode._descriptor = descriptor;
  },

  commitTextUpdate(textInstance, _oldText, newText) {
    textInstance.nodeValue = newText;
    textInstance.layoutNode.widgetOptions = { content: newText };

    // Update Yoga width when text length changes
    textInstance.layoutNode.yogaNode.setWidth(newText.length);
    textInstance.layoutNode.props.width = newText.length;
  },

  // Commit hooks
  prepareForCommit: () => null,
  resetAfterCommit(rootNode) {
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
