/**
 * @Author: aric 1290657123@qq.com
 * @Date: 2025-10-31 11:13:07
 * @LastEditors: aric 1290657123@qq.com
 * @LastEditTime: 2025-10-31 11:13:49
 */
// utils/TreeDnDManager.ts

export interface TreeDnDOptions {
  orderKey?: string; // 默认 'sequence'
}

export interface DropInfo {
  dragNode: any;
  node: any;
  dropToGap: boolean;
  dropPosition: number;
}

export class TreeDnDManager {
  private readonly orderKey: string;

  constructor(options: TreeDnDOptions = {}) {
    this.orderKey = options.orderKey ?? 'sequence';
  }

  /**
   * 处理 Ant Design Tree 的 onDrop 事件，返回新的 treeData
   * @param originalTreeData 原始树数据（会深拷贝，不修改原数据）
   * @param info AntD Tree 的 onDrop 回调参数
   * @returns 新的 treeData 或 null（如果拖拽无效）
   */
  public handleDrop(originalTreeData: any[], info: DropInfo): any[] | null {
    const { dragNode, node, dropToGap, dropPosition } = info;
    if (!dragNode?.key || !node?.key) return null;

    // 深拷贝，避免修改原始数据
    const treeData = JSON.parse(JSON.stringify(originalTreeData));

    // 1. 移除被拖拽节点
    const dragObj = this.removeNodeByKey(treeData, dragNode.key);
    if (!dragObj) return null;

    // 2. 插入节点
    if (dropToGap) {
      this.insertAsSibling(treeData, node.key, dragObj, dropPosition);
    } else {
      this.insertAsChild(treeData, node.key, dragObj);
    }

    // 3. 重新计算 orderKey（同级顺序）
    this.updateOrder(treeData);

    return treeData;
  }

  // --- 私有方法 ---

  private removeNodeByKey(list: any[], key: string): any {
    for (let i = 0; i < list.length; i++) {
      if (list[i].key === key) {
        return list.splice(i, 1)[0];
      }
      if (list[i].children?.length) {
        const found = this.removeNodeByKey(list[i].children, key);
        if (found) {
          if (list[i].children.length === 0) delete list[i].children;
          return found;
        }
      }
    }
    return null;
  }

  private findNodeLocation(
    list: any[],
    targetKey: string,
    parentList: any[] = list,
  ): { parent: any[]; index: number } | null {
    for (let i = 0; i < list.length; i++) {
      if (list[i].key === targetKey) {
        return { parent: parentList, index: i };
      }
      if (list[i].children?.length) {
        const res = this.findNodeLocation(list[i].children, targetKey, list);
        if (res) return res;
      }
    }
    return null;
  }

  private insertAsSibling(treeData: any[], targetKey: string, dragObj: any, dropPosition: number): void {
    const loc = this.findNodeLocation(treeData, targetKey);
    let dropParent = treeData;
    let dropIndex = 0;

    if (loc) {
      dropParent = loc.parent;
      dropIndex = loc.index + (dropPosition > 0 ? 1 : 0);
    } else {
      // Fallback to root level
      dropIndex = treeData.findIndex((item) => item.key === targetKey);
      if (dropIndex === -1) {
        dropIndex = dropPosition > 0 ? treeData.length : 0;
      } else {
        dropIndex += dropPosition > 0 ? 1 : 0;
      }
    }

    dropParent.splice(dropIndex, 0, dragObj);
  }

  private insertAsChild(treeData: any[], targetKey: string, dragObj: any): void {
    const insert = (list: any[]): boolean => {
      for (const item of list) {
        if (item.key === targetKey) {
          if (!item.children) item.children = [];
          item.children.unshift(dragObj);
          return true;
        }
        if (item.children && insert(item.children)) {
          return true;
        }
      }
      return false;
    };
    insert(treeData);
  }

  private updateOrder(list: any[]): void {
    list.forEach((item, index) => {
      item[this.orderKey] = index + 1;
      if (item.children?.length) {
        this.updateOrder(item.children);
      }
    });
  }
}
