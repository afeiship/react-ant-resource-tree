// import noop from '@jswork/noop';
import cx from 'classnames';
import React, { ReactNode, Component } from 'react';
import { Badge, Card, CardProps, Tree, Popconfirm, Space } from 'antd';
import { AcTree, AcTreeProps } from '@jswork/antd-components';

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
  header?: ReactNode;
  footer?: ReactNode;
  params?: any;
  hasBack?: boolean;
  actions?: string[];
  apiPath?: string;
  items?: AcTreeProps['items'];
  orderKey?: string;
  // columns: AcTableColumn[];
  // tableProps?: Omit<AcTableProps, 'name' | 'columns' | 'params'>;
};

type ReactAntResourceTreeState = {};

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
    items: [],
    orderKey: 'sequence',
  };

  current: any = null;

  constructor(props: ReactAntResourceTreeProps) {
    super(props);
    this.state = {};
  }

  t = (inKey) => {
    const { lang } = this.props;
    return nx.get(locales, `${lang}.${inKey}`, inKey);
  };

  edit = () => {
  };
  del = () => {
  };

  template = ({ item, index }, cb) => {
    const { value, label } = item;
    const { orderKey } = this.props;
    const update = () => (this.current = { index, item });
    const order = nx.get(item, orderKey!);
    const isLeaf = Boolean(!item.children);

    const titleView = (
      <Space onMouseEnter={update}>
        <Badge size="small" count={order}>
          {label}
        </Badge>
        <a onClick={this.edit}>{this.t('edit')}</a>
        <Popconfirm title={this.t('confirm_ok')} onConfirm={this.del} onCancel={stop}>
          <a onClick={stop}>{this.t('delete')}</a>
        </Popconfirm>
      </Space>
    );

    return (
      <Tree.TreeNode key={value} isLeaf={isLeaf} title={titleView}>
        {cb?.()}
      </Tree.TreeNode>
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
        <AcTree
          showLine
          selectable={false}
          items={items}
          template={this.template}
        />
        {footer}
      </Card>
    );
  }
}
