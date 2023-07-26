import { Table, Typography } from 'antd'
import type { ColumnsType, TableProps } from 'antd/es/table'
import { useMemo } from 'react'
import type { MissingComponent } from '~/models/drawings.model'

interface MissingComponentTableProps {
  missingComponents: MissingComponent[]
}

const MissingComponentTable = (props: MissingComponentTableProps) => {
  const handleChange: TableProps<MissingComponent>['onChange'] = (
    _pagination,
    _filters,
    _sorter,
  ) => {
    // console.log('Various parameters', pagination, filters, sorter)
  }

  const columns = useMemo<ColumnsType<MissingComponent>>(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        filters: props.missingComponents
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
        title: 'Line Type',
        dataIndex: 'line_type',
        key: 'line_type',
        filters: props.missingComponents
          .map((component) => ({
            text: component.line_type,
            value: component.line_type,
          }))
          // remove the same line type
          .filter((value, index, self) => self.findIndex((v) => v.value === value.value) === index),
        // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
        onFilter: (value: string, record) => record.line_type.indexOf(value) === 0,
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
    [props.missingComponents],
  )

  return (
    <Table
      bordered
      onChange={handleChange}
      caption={<Typography.Title level={5}>Missing Components</Typography.Title>}
      columns={columns}
      dataSource={props.missingComponents}
    />
  )
}

export default MissingComponentTable
