/* eslint-disable no-sparse-arrays */
import React, { useState, useRef } from 'react';
import { Input, Collapse, Table, Tabs } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

const App = () => {
  const { Search } = Input;
  const { Panel } = Collapse;
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [widgetHeight, setWidgetHeight] = useState(40);
  const [responseArray, setResponseArray] = useState([]);
  const divRef = useRef(null);

  const scrollToDiv = () => {
    divRef.current.scrollTop = divRef.current.scrollHeight;
  }
  

  const handleSubmit = async (query) => {
    setLoading(true);
    const response = await fetch('https://test-defog-chrome-ext-ikcpfh5tva-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: query,
        previous_context: previousQuestions,
      })
    });
    const data = await response.json();
    let newCols;
    let newRows;
    if (data.columns && data?.data.length > 0) {
      const cols = data.columns;
      const rows = data.data;
      newCols = [];
      newRows = [];
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
    } else {
      newCols = [];
      newRows = [];
    }
    const contextQuestions = [query, data.query_generated]
    setPreviousQuestions([...previousQuestions, ...contextQuestions]);
    setWidgetHeight(400);
    setLoading(false);

    setResponseArray([...responseArray, {
      queryReason: data.reason_for_query,
      data: newRows,
      columns: newCols,
      suggestedQuestions: data.suggestion_for_further_questions,
      question: query,
      generatedSql: data.query_generated,
    }]);
    // scroll to the bottom of the results div
    const resultsDiv = document.getElementById("results");
    resultsDiv.scrollTop = resultsDiv.scrollHeight;
  };

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0 }}>
      <div style={{ padding: 0, color: '#fff', border: "1px solid lightgrey", borderRadius: 10 }}>
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
            <div style={{width: 600, maxHeight: 500, overflow: "auto"}} id="results" ref={divRef}>
              {responseArray.map((response, index) => {
                return (
                  <div key={index}>
                    <hr style={{borderTop: "1px dashed lightgrey"}}/>
                    <p style={{ marginTop: 10 }}>{response.question}</p>
                    <p style={{ color: "grey", fontSize: 12, marginTop: 10 }}>{response.queryReason}</p>
                    <Table
                      dataSource={response.data}
                      columns={response.columns}
                      style={{
                        maxHeight: 300,
                        overflow: "auto",
                      }}
                      size="small"
                      pagination={{ pageSize: 5}}
                    />
                    <p style={{ color: "grey", fontSize: 12, marginTop: 10 }}>{response.suggestedQuestions}</p>
                  </div>
                )
              })}
            </div>
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
          </Panel>
        </Collapse>
      </div>
    </div>
  );
};

export default App;