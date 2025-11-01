/**
 * dom.ts - Virtual DOM for @unblessed/react
 *
 * This module defines the virtual DOM structure that bridges React components
 * to @unblessed/layout's LayoutNodes and ultimately to unblessed widgets.
 *
 * Key insight: We use LayoutNode from @unblessed/layout as our "DOM" nodes.
 * The reconciler creates/updates LayoutNodes, and @unblessed/layout handles
 * the Yoga calculations and widget synchronization.
 */

import { BigText, Screen } from "@unblessed/core";
import type { LayoutNode } from "@unblessed/layout";
import { BoxProps } from "./components/Box";
import { TextProps } from "./components/Text";

/**
 * Element types in our virtual DOM
 */
export type ElementType = "box" | "text" | "root";

/**
 * Virtual DOM node - wraps a LayoutNode with React-specific metadata
 */
export interface DOMNode {
  /**
   * Element type
   */
  type: ElementType;

  /**
   * The underlying layout node (from @unblessed/layout)
   * This is what gets passed to LayoutManager
   */
  layoutNode: LayoutNode;

  /**
   * React props for this node
   */
  props: BoxProps | TextProps | BigText | Record<string, unknown>;

  /**
   * Parent DOM node
   */
  parentNode: DOMNode | null;

  /**
   * Child DOM nodes
   */
  childNodes: AnyNode[];

  /**
   * The screen instance (only on root node)
   */
  screen?: Screen;

  /**
   * Callback for layout calculation (only on root node)
   */
  onComputeLayout?: () => void;
}

/**
 * Text node in the virtual DOM
 */
export interface TextNode {
  /**
   * Always '#text' for text nodes
   */
  type: "#text";

  /**
   * The text content
   */
  nodeValue: string;

  /**
   * Text styling props
   */
  props: TextProps;

  /**
   * Parent DOM node
   */
  parentNode: DOMNode | null;

  /**
   * The underlying layout node
   */
  layoutNode: LayoutNode;
}

/**
 * Union type for all node types
 */
export type AnyNode = DOMNode | TextNode;

/**
 * Creates a new DOM element node
 */
export function createElement(
  type: ElementType,
  layoutNode: LayoutNode,
  props: any = {},
): DOMNode {
  return {
    type,
    layoutNode,
    props,
    parentNode: null,
    childNodes: [],
  };
}

/**
 * Creates a new text node
 */
export function createTextNode(
  text: string,
  layoutNode: LayoutNode,
  props: TextProps = {},
): TextNode {
  return {
    type: "#text",
    nodeValue: text,
    props,
    parentNode: null,
    layoutNode,
  };
}

/**
 * Appends a child node to a parent
 */
export function appendChild(parent: DOMNode, child: AnyNode): void {
  child.parentNode = parent;
  parent.childNodes.push(child);
}

/**
 * Inserts a child before a reference child
 */
export function insertBefore(
  parent: DOMNode,
  child: AnyNode,
  beforeChild: AnyNode,
): void {
  const index = parent.childNodes.indexOf(beforeChild);
  if (index === -1) {
    throw new Error("Reference child not found in parent");
  }

  child.parentNode = parent;
  parent.childNodes.splice(index, 0, child);
}

/**
 * Removes a child node from its parent
 */
export function removeChild(parent: DOMNode, child: AnyNode): void {
  const index = parent.childNodes.indexOf(child);
  if (index === -1) return;

  parent.childNodes.splice(index, 1);
  child.parentNode = null;
}

/**
 * Updates a node's props
 */
export function updateNodeProps(node: DOMNode | TextNode, props: any): void {
  node.props = props;
}
