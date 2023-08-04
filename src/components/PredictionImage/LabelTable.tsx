import type { TableColumnsType } from 'antd'
import { Table } from 'antd'
import React from 'react'

interface DataType {
  key: React.Key
  name: string
  platform: string
  version: string
  upgradeNum: number
  creator: string
  createdAt: string
}

interface ExpandedDataType {
  key: React.Key
  date: string
  name: string
  upgradeNum: string
}

const LabelTable = () => {
  const expandedRowRender = () => {
    const columns: TableColumnsType<ExpandedDataType> = [
      { title: '', dataIndex: 'name', key: 'name' },
      {
        title: '',
        dataIndex: 'operation',
        key: 'operation',
        render: () => <a>Action</a>,
      },
    ]

    const data = []
    for (let i = 0; i < 3; ++i) {
      data.push({
        key: i.toString(),
        date: '2014-12-24 23:12:00',
        name: 'This is production name',
        upgradeNum: 'Upgraded: 56',
      })
    }
    return <Table columns={columns} dataSource={data} size="small" pagination={false} />
  }

  const columns: TableColumnsType<DataType> = [
    { title: '', dataIndex: 'name', key: 'name' },
    { title: '', key: 'operation', render: () => <a>Action</a> },
  ]

  const data: DataType[] = []
  for (let i = 0; i < 3; ++i) {
    data.push({
      key: i.toString(),
      name: 'Screen',
      platform: 'iOS',
      version: '10.3.4.5654',
      upgradeNum: 500,
      creator: 'Jack',
      createdAt: '2014-12-24 23:12:00',
    })
  }

  return (
    <>
      <Table
        columns={columns}
        expandable={{ expandedRowRender }}
        dataSource={data}
        size="small"
        pagination={false}
      />
    </>
  )
}

export default LabelTable
