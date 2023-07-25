import { Table, Typography } from 'antd'
import type { ColumnsType, TableProps } from 'antd/es/table'
import { useMemo } from 'react'
import type { DrawingComponent } from '~/models/drawings.model'

interface DrawingComponentTableProps {
  drawingComponents: DrawingComponent[]
}

const DrawingComponentTable = (props: DrawingComponentTableProps) => {
  const handleChange: TableProps<DrawingComponent>['onChange'] = (
    _pagination,
    _filters,
    _sorter,
  ) => {
    // console.log('Various parameters', pagination, filters, sorter)
  }

  const columns = useMemo<ColumnsType<DrawingComponent>>(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        filters: props.drawingComponents
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
    [props.drawingComponents],
  )

  return (
    <Table
      onChange={handleChange}
      caption={<Typography.Title level={5}>Drawing Components</Typography.Title>}
      columns={columns}
      dataSource={props.drawingComponents}
    />
  )
}

export default DrawingComponentTable
