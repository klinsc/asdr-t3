import { Table, Typography } from 'antd'
import type { ColumnsType, TableProps } from 'antd/es/table'
import { useMemo } from 'react'
import type { RemainingComponent } from '~/models/drawings.model'

interface RemainingComponentTableProps {
  remainingComponents: RemainingComponent[]
}

const RemainingComponentTable = (props: RemainingComponentTableProps) => {
  const handleChange: TableProps<RemainingComponent>['onChange'] = (
    _pagination,
    _filters,
    _sorter,
  ) => {
    // console.log('Various parameters', pagination, filters, sorter)
  }

  const columns = useMemo<ColumnsType<RemainingComponent>>(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        filteredValue: props.remainingComponents
          .filter((component) => component.count > 0)
          .map((component) => component.name)
          // remove the same line type
          .filter(
            (value, index, self) =>
              self.findIndex((v) => v === value) === index,
          ),
        // filters: props.remainingComponents
        //   .filter((component) => component.count > 0)
        //   .map((component) => ({
        //     text: component.name,
        //     value: component.name,
        //   }))
        //   // remove the same line type
        //   .filter(
        //     (value, index, self) =>
        //       self.findIndex((v) => v.value === value.value) === index,
        //   ),
        onFilter: (value, record) => record.name.startsWith(String(value)),
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
    [props.remainingComponents],
  )

  return (
    <Table
      bordered
      onChange={handleChange}
      caption={
        <Typography.Title level={5}>Remaining Components</Typography.Title>
      }
      columns={columns}
      dataSource={props.remainingComponents}
    />
  )
}

export default RemainingComponentTable
