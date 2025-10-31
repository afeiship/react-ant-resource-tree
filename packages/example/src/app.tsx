import ReactAntResourceTree from '@jswork/react-ant-resource-tree/src/main';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import '@jswork/react-ant-resource-tree/src/style.scss';

function App() {
  const fetcher = async () => {
    const response = await fetch('/tree.json').then(r => r.json());
    return {
      data: response,
    };
  };
  return (
    <ConfigProvider locale={zhCN}>
      <div className="m-10 p-4 shadow bg-gray-100 text-gray-800 hover:shadow-md transition-all">
        <div className="badge badge-warning absolute right-0 top-0 m-4">
          Build Time: {BUILD_TIME}
        </div>
        <ReactAntResourceTree
          title="Tree管理"
          name="categories"
          fetcher={fetcher}
          cardExtraProps={{ actions: ['refresh', 'add', 'back'] }}
        />
      </div>
    </ConfigProvider>
  );
}

export default App;
