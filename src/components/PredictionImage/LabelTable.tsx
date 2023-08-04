import type { TableColumnsType } from 'antd'
import { Switch, Table } from 'antd'
import React, { useState, type Dispatch, type SetStateAction, useEffect } from 'react'
import type { RectangleProps } from '.'

interface LabelTableProps {
  rectangles: RectangleProps[]
  setRectangles: Dispatch<SetStateAction<RectangleProps[]>>
}

interface RectangleGroup {
  key: string
  name: string
  visible: boolean
  nested: RectangleProps[]
}

const LabelTable = ({ rectangles, setRectangles }: LabelTableProps) => {
  // hooks
  const [rectangleGroups, setRectangleGroups] = useState<RectangleGroup[]>([])

  const columns: TableColumnsType<RectangleGroup> = [
    {
      title: '',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '',
      dataIndex: 'visible',
      key: 'visible',
      render: (value: boolean, record) => (
        <Switch
          size="small"
          defaultChecked={value}
          onChange={(checked) => {
            const newRectangles = rectangles.map((rectangle) => {
              if (rectangle.name === record.name) {
                return {
                  ...rectangle,
                  visible: checked,
                }
              }
              return rectangle
            })
            setRectangles(newRectangles)

            const newRectangleGroups = rectangleGroups.map((group) => {
              if (group.name === record.name) {
                return {
                  ...group,
                  visible: checked,
                }
              }
              return group
            })
            setRectangleGroups(newRectangleGroups)

            debugger
          }}
        //   checked={value}
        />
      ),
    },
  ]

  // effects
  // calculate new rectanglegroups from rectangles
  useEffect(() => {
    const newGroups = rectangles.reduce((acc: RectangleGroup[], cur) => {
      const { name } = cur
      const groupIndex = acc.findIndex((group) => group.name === name)
      if (groupIndex === -1) {
        acc.push({
          key: name,
          name,
          visible: true,
          nested: [cur],
        })
      } else {
        acc[groupIndex]?.nested.push(cur)
      }
      return acc
    }, [])
    setRectangleGroups(newGroups)
  }, [rectangles])

  return (
    <>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender: (record) => {
            const columns: TableColumnsType<RectangleProps> = [
              { title: '', dataIndex: 'name', key: 'name' },
              {
                title: '',
                dataIndex: 'visible',
                key: 'visible',
                render: (_value, nestRecord) => (
                  <Switch
                    size="small"
                    defaultChecked={nestRecord.visible}
                    onChange={(checked) => {
                      const newRectangles = rectangles.map((rectangle) => {
                        if (rectangle.id === nestRecord.id) {
                          return {
                            ...rectangle,
                            visible: checked,
                          }
                        }
                        return rectangle
                      })

                      setRectangles(newRectangles)
                    }}
                    checked={nestRecord.visible}
                  />
                ),
              },
            ]

            return (
              <Table
                columns={columns}
                dataSource={record.nested}
                size="small"
                pagination={false}
                bordered={false}
              />
            )
          },
        }}
        dataSource={rectangleGroups}
        size="small"
        pagination={false}
        bordered={false}
      />
    </>
  )
}

export default LabelTable
