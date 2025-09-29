declare module "vue-virtual-scroller" {
  import { DefineComponent } from "vue";

  // 普通列表（定高）
  export const RecycleScroller: DefineComponent<{
    items: any[];
    itemSize: number;
    keyField: string;
  }>;

  // 动态高度列表
  export const DynamicScroller: DefineComponent<{
    items: any[];
    minItemSize: number;
    keyField: string;
  }>;

  export const DynamicScrollerItem: DefineComponent<{
    item: any;
    active: boolean;
    size?: number;
  }>;
}
