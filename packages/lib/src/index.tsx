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
  rowKey?: string;
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
    rowKey: 'id',
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
    const { name, module, rowKey } = this.props;
    const id = nx.get(item, rowKey!);
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

  handleDragEnter = (info) => {
    console.log('enter?', info);
  };

  handleDrop = (info) => {
    console.log('drop?', info);
  };

  render() {
    const {
      className,
      header,
      footer,
      orderKey,
      rowKey,
      params,
      fetcher,
      children,
      cardExtraProps,
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
          onDragEnter={this.handleDragEnter}
          onDrop={this.handleDrop}
          treeData={items}
          titleRender={this.handleTemplate}
        />
        {footer}
      </Card>
    );
  }
}
