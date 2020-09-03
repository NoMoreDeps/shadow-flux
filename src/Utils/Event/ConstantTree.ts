type HashMap = {
  [key: string] : HashMap | string;
}

/**
 * Populate an empty event tree structure
 * Ex : {
 *  ROOT: "",
 *  ACTION: {
 *    SUB_ACTION: ""
 *  }
 * }
 * 
 * Will become :
 * 
 * {
 *  ROOT: "ROOT",
 *  ACTION: {
 *    SUB_ACTION: "ACTION.SUB_ACTION"
 *  }
 * }
 * @param tree The event tree structure
 * @param route The initial starting route
 */
export function constantTree<T extends HashMap>(tree: T, route: string = ""): T {
  for(const item in tree) {
    const currentRoute = `${route}${route !== "" ? "." : ""}${item}`;

    if (typeof(tree[item]) === "string" && tree[item].length === 0) {
      (tree[item] as string) = currentRoute;
      continue;
    } 
    
    if (typeof(tree[item]) === "object") {
      constantTree(tree[item] as HashMap, currentRoute);
    }
  }

  return tree;
}