// import noop from '@jswork/noop';
import cx from 'classnames';
import React, { Component, ReactNode } from 'react';
import { Badge, Card, CardProps, Popconfirm, Space, Tree } from 'antd';
import { AcCardExtras, AcCardExtrasProps, AcTreeProps } from '@jswork/antd-components';
import type { EventMittNamespace } from '@jswork/event-mitt';
import { ReactHarmonyEvents } from '@jswork/harmony-events';
import nx from '@jswork/next';

const CLASS_NAME = 'react-ant-resource-tree';

declare global {
  interface NxStatic {
    $event: any;
    $nav: any;
  }
}

export type ReactAntResourceTreeProps = CardProps & {
  name: string;
  lang?: string;
  module?: string;
  fetcher?: (params?: any) => Promise<{ data: AcTreeProps['items'] }>;
  header?: ReactNode;
  footer?: ReactNode;
  params?: any;
  orderKey?: string;
  cardExtraProps?: Omit<AcCardExtrasProps, 'name' | 'lang'>;
  treeProps?: Omit<AcTreeProps, 'items' | 'titleRender'>;
};

type ReactAntResourceTreeState = {
  loading?: boolean;
  items?: AcTreeProps['items'];
};

const locales = {
  'zh-CN': {
    edit: '编辑',
    delete: '删除',
    confirm_ok: '确认删除？',
  },
  'en-US': {
    edit: 'Edit',
    delete: 'Delete',
    confirm_ok: 'Confirm?',
  },
};

export default class ReactAntResourceTree extends Component<ReactAntResourceTreeProps, ReactAntResourceTreeState> {
  static displayName = CLASS_NAME;
  static version = '__VERSION__';
  static defaultProps = {
    lang: 'zh-CN',
    module: 'admin',
    orderKey: 'sequence',
    params: {},
    header: null,
    footer: null,
    cardExtraProps: {
      actions: ['add', 'refresh'],
    },
  };

  static event: EventMittNamespace.EventMitt;
  static events = ['add', 'edit', 'destroy', 'refetch'];
  public eventBus: EventMittNamespace.EventMitt = ReactAntResourceTree.event;
  private harmonyEvents: ReactHarmonyEvents | null = null;

  get extraView() {
    const { cardExtraProps, name, lang } = this.props;
    return <AcCardExtras name={name} lang={lang} {...cardExtraProps} />;
  }

  constructor(props: ReactAntResourceTreeProps) {
    super(props);
    this.state = {
      items: [],
      loading: false,
    };
  }

  async componentDidMount() {
    this.harmonyEvents = ReactHarmonyEvents.create(this);
    this.eventBus = ReactAntResourceTree.event;
    void this.fetchData();
  }

  async componentDidUpdate(prevProps: ReactAntResourceTreeProps) {
    const { params, fetcher } = this.props;
    const shouldFetch = params !== prevProps.params || fetcher !== prevProps.fetcher;
    if (shouldFetch) {
      void this.fetchData();
    }
  }

  componentWillUnmount() {
    this.harmonyEvents?.destroy();
  }

  t = (inKey: string) => {
    const { lang } = this.props;
    return nx.get(locales, `${lang}.${inKey}`, inKey);
  };


  fetchData = async () => {
    const { params, fetcher } = this.props;
    this.setState({ loading: true });
    const response = await fetcher?.(params);
    this.setState({ items: response?.data ?? [], loading: false });
  };

  /* ----- public eventBus methods start ----- */
  public add = () => {
    const { name, module } = this.props;
    nx.$nav?.(`/${module}/${name}/add`);
  };
  /**
   * CURD(page): Redirect to edit page.
   * @param item
   */
  public edit = (item: any) => {
    const { name, module } = this.props;
    const id = nx.get(item, 'key');
    nx.$nav?.(`/${module}/${name}/${id}/edit`);
  };

  /**
   * CURD(action): Fetch data from backend.
   */
  public refetch = () => {
    void this.fetchData();
  };

  /**
   * CURD(action): Delete data from backend.
   */
  public destroy = (payload: any) => {
    const { name } = this.props;
    this.setState({ loading: true });
    nx.$api[`${name}_destroy`](payload)
      .then(this.refetch)
      .finally(() => {
        this.setState({ loading: false });
      });
  };
  /* ----- public eventBus methods end   ----- */

  handleTemplate = (item) => {
    const { orderKey } = this.props;
    const order = nx.get(item, orderKey!, 0);
    return (
      <Space size="middle">
        <Badge size="small" count={order}>
          {item.label}
        </Badge>
        <Space>
          <a onClick={() => this.edit(item)}>{this.t('edit')}</a>
          <Popconfirm title={this.t('confirm_ok')} onConfirm={() => this.destroy(item)}>
            <a>{this.t('delete')}</a>
          </Popconfirm>
        </Space>
      </Space>
    );
  };

  handleDrop = (info: any) => {
    const { orderKey } = this.props;
    const { dragNode, dropToGap, dropPosition, node } = info;

    // 深拷贝当前树数据
    const data = JSON.parse(JSON.stringify(this.state.items || []));

    // 1. 找到并移除被拖拽的节点
    let dragObj: any = null;
    const removeNode = (list: any[]): boolean => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].key === dragNode.key) {
          dragObj = list.splice(i, 1)[0];
          return true;
        }
        if (list[i].children?.length && removeNode(list[i].children)) {
          // 清理空 children（可选）
          if (list[i].children.length === 0) delete list[i].children;
          return true;
        }
      }
      return false;
    };

    removeNode(data);
    if (!dragObj) return;

    // 2. 插入逻辑
    if (dropToGap) {
      // 插入为兄弟节点
      const findNodeLocation = (list: any[], targetKey: string): { parent: any[]; index: number } | null => {
        for (let i = 0; i < list.length; i++) {
          if (list[i].key === targetKey) {
            return { parent: list, index: i };
          }
          if (list[i].children) {
            const res = findNodeLocation(list[i].children, targetKey);
            if (res) return res;
          }
        }
        return null;
      };

      const loc = findNodeLocation(data, node.key);
      let dropParent = data;
      let dropIndex = 0;

      if (loc) {
        dropParent = loc.parent;
        dropIndex = loc.index + (dropPosition > 0 ? 1 : 0);
      } else {
        // fallback: root level
        dropIndex = data.findIndex((item) => item.key === node.key);
        if (dropIndex === -1) dropIndex = dropPosition > 0 ? data.length : 0;
        else dropIndex += dropPosition > 0 ? 1 : 0;
      }

      dropParent.splice(dropIndex, 0, dragObj);
    } else {
      // 插入为子节点：直接操作目标节点的 children
      const insertAsChild = (list: any[]) => {
        for (const item of list) {
          if (item.key === node.key) {
            if (!item.children) item.children = [];
            item.children.unshift(dragObj); // 或 .push(dragObj)
            return true;
          }
          if (item.children && insertAsChild(item.children)) {
            return true;
          }
        }
        return false;
      };
      insertAsChild(data);
    }

    // 3. 重新计算 sequence：仅表示同级顺序
    const updateOrder = (list: any[]) => {
      list.forEach((item, idx) => {
        item[orderKey!] = idx + 1; // 同级从 1 开始
        if (item.children?.length) {
          updateOrder(item.children); // 递归处理子级，子级有自己的 sequence
        }
      });
    };

    updateOrder(data);

    // 4. 更新状态
    this.setState({ items: data });
  };

  render() {
    const {
      className,
      header,
      footer,
      orderKey,
      params,
      fetcher,
      children,
      cardExtraProps,
      treeProps,
      ...rest
    } = this.props;
    const { items, loading } = this.state;

    return (
      <Card
        data-component={CLASS_NAME}
        className={cx(CLASS_NAME, className)}
        extra={this.extraView}
        loading={loading}
        {...rest}>
        {header}
        <Tree
          showLine
          selectable={false}
          defaultExpandAll
          draggable
          blockNode
          onDrop={this.handleDrop}
          treeData={items}
          titleRender={this.handleTemplate}
          {...treeProps}
        />
        {footer}
      </Card>
    );
  }
}
