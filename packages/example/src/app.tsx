import ReactAntResourceTree from '@jswork/react-ant-resource-tree/src/main';
import '@jswork/react-ant-resource-tree/src/style.scss';

function App() {
  return (
    <div className="m-10 p-4 shadow bg-gray-100 text-gray-800 hover:shadow-md transition-all">
      <div className="badge badge-warning absolute right-0 top-0 m-4">
        Build Time: {BUILD_TIME}
      </div>
      <ReactAntResourceTree className="debug-red">
        abc
      </ReactAntResourceTree>
    </div>
  );
}

export default App;
