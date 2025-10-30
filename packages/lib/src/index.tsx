// import noop from '@jswork/noop';
import cx from 'classnames';
import React, { Component, ReactNode } from 'react';
import { Badge, Card, CardProps, Popconfirm, Space, Tree } from 'antd';
import { AcTreeProps } from '@jswork/antd-components';
import type { EventMittNamespace } from '@jswork/event-mitt';
import { ReactHarmonyEvents } from '@jswork/harmony-events';
import nx from '@jswork/next';

const CLASS_NAME = 'react-ant-resource-tree';

declare global {
  interface NxStatic {
    $event: any;
  }
}

export type ReactAntResourceTreeProps = CardProps & {
  name: string;
  lang?: string;
  module?: string;
  fetcher?: (params: any) => Promise<{ items: AcTreeProps['items'] }>;
  header?: ReactNode;
  footer?: ReactNode;
  params?: any;
  hasBack?: boolean;
  actions?: string[];
  rowKey?: string;
  items?: AcTreeProps['items'];
  orderKey?: string;
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
    orderKey: 'sequence',
    items: [],
    hasBack: false,
    actions: [],
    rowKey: 'id',
    params: {},
    header: null,
    footer: null,
  };

  private harmonyEvents: ReactHarmonyEvents | null = null;
  static event: EventMittNamespace.EventMitt;
  static events = ['edit', 'destroy', 'refetch'];
  public eventBus: EventMittNamespace.EventMitt = ReactAntResourceTree.event;


  async componentDidMount() {
    this.harmonyEvents = ReactHarmonyEvents.create(this);
    this.eventBus = ReactAntResourceTree.event;
  }

  componentWillUnmount() {
    this.harmonyEvents?.destroy();
  }

  fetchData = async () => {
    const { params, fetcher } = this.props;
    this.setState({ loading: true })
    const response = await fetcher?.(params);
    this.setState({ items: response?.items ?? [], loading: false });
  };

  /* ----- public eventBus methods start ----- */
  /**
   * CURD(page): Redirect to edit page.
   * @param item 
   */
  public edit = (item: any) => {
    const { name, module, rowKey } = this.props;
    const id = nx.get(item, rowKey!);
    nx.$nav(`/${module}/${name}/${id}/edit`);
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
  public destroy = (item) => {
    const { name } = this.props;
    this.setState({ loading: true });
    nx.$api[`${name}_destroy`](item)
      .then(this.refetch)
      .finally(() => {
        this.setState({ loading: false });
      });
  };
  /* ----- public eventBus methods end   ----- */

  t = (inKey) => {
    const { lang } = this.props;
    return nx.get(locales, `${lang}.${inKey}`, inKey);
  };

  handleTemplate = (item) => {
    const { orderKey } = this.props;
    const order = nx.get(item, orderKey!, 0);
    return (
      <Space size="middle">
        <Badge size="small" count={order}>
          {item.label}
        </Badge>
        <Space>
          <a onClick={nx.noop}>{this.t('edit')}</a>
          <Popconfirm title={this.t('confirm_ok')} onConfirm={nx.noop} onCancel={nx.noop}>
            <a>{this.t('delete')}</a>
          </Popconfirm>
        </Space>
      </Space>
    );
  };

  render() {
    const { className, items, header, footer, orderKey, ...rest } = this.props;
    return (
      <Card
        data-component={CLASS_NAME}
        className={cx(CLASS_NAME, className)}
        {...rest}>
        {header}
        <Tree
          showLine
          selectable={false}
          defaultExpandAll
          treeData={items}
          titleRender={this.handleTemplate}
        />
        {footer}
      </Card>
    );
  }
}
