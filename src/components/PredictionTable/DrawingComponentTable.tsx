import { Table, Typography } from 'antd'
import type { ColumnsType, TableProps } from 'antd/es/table'
import { useMemo } from 'react'
import type { BoundingBox, DrawingComponent } from '~/models/drawings.model'

interface DrawingComponentTableProps {
  drawingComponents: BoundingBox[]
  size?: 'small' | 'middle' | 'large'
  bordered?: boolean
  pageSize?: number
  titled?: boolean
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
          .filter(
            (value, index, self) =>
              self.findIndex((v) => v.value === value.value) === index,
          ),
        onFilter: (value, record) => record.name.startsWith(String(value)),
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Count',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count - b.count,
        sortDirections: ['ascend', 'descend'],
      },
    ],
    [props.drawingComponents],
  )

  const data = useMemo(() => {
    // count the number of each component
    const countMap = new Map<string, number>()
    props.drawingComponents.forEach((component) => {
      const count = countMap.get(component.name) ?? 0
      countMap.set(component.name, count + 1)
    })
    // convert to {name, count} format
    const result: DrawingComponent[] = []
    countMap.forEach((count, name) => {
      result.push({ id: name, name, count })
    })

    return result
  }, [props.drawingComponents])

  return (
    <Table
      size={props.size ?? 'middle'}
      bordered={props.bordered ?? true}
      pagination={{
        pageSize: props.pageSize ?? 10,
      }}
      onChange={handleChange}
      caption={
        props.titled ? (
          <Typography.Title level={5}>Drawing Components</Typography.Title>
        ) : (
          <></>
        )
      }
      columns={columns}
      dataSource={data}
    />
  )
}

export default DrawingComponentTable
