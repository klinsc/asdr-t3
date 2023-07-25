import { Table, Typography } from 'antd'
import type { ColumnsType, TableProps } from 'antd/es/table'
import { useMemo } from 'react'
import type { LineType } from '~/models/drawings.model'

interface LineTypeTableProps {
  lineTypes: LineType[]
}

const LineTypeTable = (props: LineTypeTableProps) => {
  const handleChange: TableProps<LineType>['onChange'] = (_pagination, _filters, _sorter) => {
    // console.log('Various parameters', pagination, filters, sorter)
  }

  const columns = useMemo<ColumnsType<LineType>>(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        filters: props.lineTypes
          .map((component) => ({
            text: component.name,
            value: component.name,
          }))
          // remove the same line type
          .filter((value, index, self) => self.findIndex((v) => v.value === value.value) === index),
        // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
        onFilter: (value: string, record) => record.name.indexOf(value) === 0,
        sorter: (a, b) => a.name.length - b.name.length,
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Count',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.name.length - b.name.length,
        sortDirections: ['ascend', 'descend'],
      },
    ],
    [props.lineTypes],
  )

  return (
    <Table
      onChange={handleChange}
      caption={<Typography.Title level={5}>Line Types</Typography.Title>}
      columns={columns}
      dataSource={props.lineTypes}
    />
  )
}

export default LineTypeTable
