/* eslint-disable no-sparse-arrays */
import React, { useState, useEffect } from 'react';
import { Input, Collapse, Table, Tabs } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

const App = () => {
  const { Search } = Input;
  const { Panel } = Collapse;
  const [isActive, setIsActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [tabItems, setTabItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [generatedSql, setGeneratedSql] = useState(null);
  const [widgetHeight, setWidgetHeight] = useState(40);

  useEffect(() => {
    setTabItems([
      {
        key: "1",
        label: "Results",
        children: columns.length > 0 ? 
          <div style={{ width: 600, height: widgetHeight }}>
            <Table
              dataSource={data}
              columns={columns}
              loading={loading}
              style={{
                height: 380,
                overflow: "auto",
              }}
              size="small"
            />
          </div>
          : null
        },
      ,
      {
        key: "2",
        label: "SQL",
        children: loading ? <pre style={{height: 372, overflow: "auto"}}>Loading...</pre> :<pre style={{ height: 372, width: 600, overflow: "auto", whiteSpace: "pre-wrap", textAlign: "left" }}>{generatedSql}</pre>,
      },
    ]);
  }, [loading]);

  const handleSubmit = async (query) => {
    setLoading(true);
    const response = await fetch('https://test-defog-ikcpfh5tva-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: query })
    });
    const data = await response.json();
    if (data.columns && data?.data.length > 0) {
      const cols = data.columns;
      const rows = data.data;
      let newCols = [];
      let newRows = [];
      for (let i = 0; i < cols.length; i++) {
        newCols.push({
          title: cols[i],
          dataIndex: cols[i],
          key: cols[i],
          sorter: rows.length > 0 && typeof rows[0][i] === "number" ? (a, b) => a[cols[i]] - b[cols[i]] : (a, b) => String(a[cols[i]]).localeCompare(String(b[cols[i]])),
        });
      }
      for (let i = 0; i < rows.length; i++) {
        let row = {};
        for (let j = 0; j < cols.length; j++) {
          row[cols[j]] = rows[i][j];
        }
        rows["key"] = i;
        newRows.push(row);
      }
      setData(newRows);
      setColumns(newCols);
    } else {
      setData([]);
      setColumns([]);
    }
    setGeneratedSql(data.query_generated);
    setWidgetHeight(400);
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0 }}>
      <div style={{ padding: 0, color: '#fff', border: "1px solid lightgrey", borderRadius: 10 }} onClick={() => setInputValue('')}>
        {/* add a button on the top right of this div with an expand arrow */}
        <Collapse
          bordered={false}
          defaultActiveKey={[null]}
          expandIconPosition="right"
          style={{ color: '#fff', backgroundColor: "#fff" }}
          expandIcon={() => <CaretRightOutlined rotate={isActive ? 90 : 270} />}
          onChange={(state) => state.length > 1 ? setIsActive(true) : setIsActive(false)}
        >
          <Panel header="Ask Defog" key="1" style={{ color: '#fff' }}>
            <Search
              placeholder="input search text"
              allowClear
              enterButton="Ask Defog"
              size="large"
              onSearch={handleSubmit}
              style={{ width: 600 }}
              loading={loading}
              disabled={loading}
            />
            {columns.length > 0 ? <Tabs
              defaultActiveKey="1"
              items={tabItems}
              onChange={(key) => console.log(key)}
            /> : null}
          </Panel>
        </Collapse>
      </div>
    </div>
  );
};

export default App;