import {
  CaretDownOutlined,
  CaretUpOutlined,
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  Button,
  Input,
  Modal,
  Space,
  Table,
  Tree,
  Typography,
  message,
} from 'antd'
import type { DataNode } from 'antd/es/tree'
import { useRouter } from 'next/router'
import { api } from '~/utils/api'

// enum ComponentType {
//   MANDATORY = 'mandatory',
//   OPTIONAL = 'optional',
// }

interface DrawingLineTypeTreeProps {
  drawingTypeId: string
}

const DrawingLineTypeTreeDev = ({
  drawingTypeId,
}: DrawingLineTypeTreeProps) => {
  // router
  const router = useRouter()
  const { creating, editing, lineTypeId } = router.query

  // messageAPI
  const [messageApi, contextHolder] = message.useMessage()

  // trpcs: getLineTypeComponents
  const getAllLineTypes = api.lineType.getAllWithComponents.useQuery({
    drawingTypeId,
  })
  // trpcs: getDrawingType
  const getDrawingType = api.drawingType.getOne.useQuery({
    id: drawingTypeId,
  })
  // trpcs: updateDrawingType
  const updateDrawingType = api.drawingType.update.useMutation({
    onSuccess: () => {
      void messageApi.success('Update drawing type successfully')

      // refetch
      void getDrawingType.refetch()

      // reset editing
      void router.push({
        pathname: '/map',
        query: {
          ...router.query,
          editing: undefined,
          drawingTypeId: undefined,
        },
      })
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: createLineType
  const createLineType = api.lineType.create.useMutation({
    onSuccess: () => {
      void messageApi.success('Add line type successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()

      // reset creating
      void router.push({
        pathname: '/map',
        query: {
          ...router.query,
          creating: undefined,
          drawingTypeId: undefined,
        },
      })
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: deleteLineType
  const deleteLineType = api.lineType.delete.useMutation({
    onSuccess: () => {
      void messageApi.success('Delete line type successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: updateLineType
  const updateLineType = api.lineType.update.useMutation({
    onSuccess: () => {
      void messageApi.success('Update line type successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()

      // reset editing
      void router.push({
        pathname: '/map',
        query: {
          ...router.query,
          editing: undefined,
          lineTypeId: undefined,
        },
      })
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: upLineType
  const upLineType = api.lineType.upIndex.useMutation({
    onSuccess: () => {
      void messageApi.success('Up line type successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: downLineType
  const downLineType = api.lineType.downIndex.useMutation({
    onSuccess: () => {
      void messageApi.success('Down line type successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })

  // Components: DrawingTypeNode
  const DrawingTypeNode = () => {
    return (
      <>
        {updateDrawingType.isLoading ? (
          <LoadingOutlined />
        ) : (
          <Space align="center" size="small">
            {editing === 'drawingType' &&
            drawingTypeId === getDrawingType.data?.id ? (
              <Input
                size="small"
                autoFocus
                defaultValue={getDrawingType.data?.name}
                onPressEnter={(e) => {
                  if (!getDrawingType.data) return

                  // check if the value is the same as the current name
                  if (e.currentTarget.value === getDrawingType.data.name) return

                  // update
                  void updateDrawingType.mutate({
                    id: getDrawingType.data?.id,
                    name: e.currentTarget.value,
                  })
                }}
                onKeyDown={(e) => {
                  // check if the key is escape
                  if (e.key === 'Escape') {
                    // refetch
                    void getDrawingType.refetch()

                    // reset editing
                    void router.push({
                      pathname: '/map',
                      query: {
                        ...router.query,
                        editing: undefined,
                        drawingTypeId: undefined,
                      },
                    })
                  }
                }}
              />
            ) : (
              <Typography.Text>{getDrawingType.data?.name}</Typography.Text>
            )}

            <Button
              type="text"
              shape="circle"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                void router.push({
                  pathname: '/map',
                  query: {
                    ...router.query,
                    editing: 'drawingType',
                    drawingTypeId: getDrawingType.data?.id,
                  },
                })
              }}
            />

            <Button
              type="text"
              shape="circle"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                void router.push({
                  pathname: '/map',
                  query: {
                    ...router.query,
                    creating: 'lineType',
                    drawingTypeId: getDrawingType.data?.id,
                  },
                })
              }}
            />
          </Space>
        )}
      </>
    )
  }

  // Components: LineTypesNode
  const lineTypesNode = () => {
    const lineTypes = getAllLineTypes.data?.map((lineType) => ({
      title: (
        <Space align="center" size="small">
          <Space.Compact size="small">
            {/* Up/Down button */}
            <Button
              type="text"
              shape="circle"
              size="small"
              icon={<CaretUpOutlined />}
              onClick={() => {
                void upLineType.mutate({ id: lineType.id })
              }}
            />
            <Button
              type="text"
              shape="circle"
              size="small"
              icon={<CaretDownOutlined />}
              onClick={() => {
                void downLineType.mutate({ id: lineType.id })
              }}
            />
          </Space.Compact>

          {editing === 'lineType' && lineTypeId === lineType.id ? (
            <Input
              size="small"
              autoFocus
              defaultValue={lineType.name}
              onPressEnter={(e) => {
                // check if the value is the same as the current name
                if (e.currentTarget.value === lineType.name) return

                // update
                void updateLineType.mutate({
                  id: lineType.id,
                  name: e.currentTarget.value,
                })
              }}
              onKeyDown={(e) => {
                // check if the key is escape
                if (e.key === 'Escape') {
                  // refetch
                  void getDrawingType.refetch()

                  // reset editing
                  void router.push({
                    pathname: '/map',
                    query: {
                      ...router.query,
                      editing: undefined,
                      drawingTypeId: undefined,
                    },
                  })
                }
              }}
            />
          ) : (
            <Typography.Text>{lineType.name}</Typography.Text>
          )}
          <Button
            type="text"
            shape="circle"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              void router.push({
                pathname: '/map',
                query: {
                  ...router.query,
                  editing: 'lineType',
                  lineTypeId: lineType.id,
                },
              })
            }}
          />
          <Button
            type="text"
            shape="circle"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              // get user confirmation
              Modal.confirm({
                title: 'Do you want to delete this line type?',
                content: `Line type: "${lineType.name}"`,
                okText: 'Yes',
                cancelText: 'No',
                onOk: () => {
                  // delete
                  void deleteLineType.mutate({ id: lineType.id })
                },
              })
            }}
          />
        </Space>
      ),
      key: lineType.id,
      children: lineType.components.map((component) => ({
        title: component.Component.name,
        key: component.id,
      })),
    }))

    // check if lineTypes is undefined
    if (!lineTypes) return []

    return lineTypes
  }

  const treeData: DataNode[] = [
    {
      title: getDrawingType.data ? <DrawingTypeNode /> : 'Drawing Type',
      key: '0',
      children:
        creating === 'lineType' && drawingTypeId
          ? [
              ...lineTypesNode(),
              // newLineType component
              {
                title: (
                  <Input
                    size="small"
                    defaultValue="New Line Type"
                    autoFocus
                    onPressEnter={(e) => {
                      // save newLineType
                      void createLineType.mutate({
                        drawingTypeId,
                        name: e.currentTarget.value,
                      })
                    }}
                    onKeyDown={(e) => {
                      // check if the key is escape
                      if (e.key === 'Escape') {
                        // refetch
                        void getDrawingType.refetch()

                        // reset creating
                        void router.push({
                          pathname: '/map',
                          query: {
                            ...router.query,
                            creating: undefined,
                            drawingTypeId: undefined,
                          },
                        })
                      }
                    }}
                  />
                ),
                key: 'newLineType',
              },
            ]
          : lineTypesNode(),
    },
  ]

  return (
    <>
      {/* messageAPI */}
      {contextHolder}

      {/* Tree */}
      {getAllLineTypes.data ? (
        <Tree
          selectable={false}
          showLine
          defaultExpandAll
          treeData={treeData}
        />
      ) : (
        <Table dataSource={[]} key={'dummyTabl'} />
      )}
    </>
  )
}

export default DrawingLineTypeTreeDev
