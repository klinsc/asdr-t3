import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  LoadingOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { css, cx } from '@emotion/css'
import { ComponentType } from '@prisma/client'
import {
  Button,
  Col,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tree,
  Typography,
  message,
  type InputRef,
  type RadioChangeEvent,
} from 'antd'
import type { DataNode, TreeProps } from 'antd/es/tree'
import { useRouter } from 'next/router'
import { type NodeMouseEventParams } from 'rc-tree/lib/contextTypes'
import { useRef, useState } from 'react'
import { api } from '~/utils/api'

const editTextNode = css`
  margin: -1px;
  border: 1px solid transparent;
  &:hover {
    border: 1px solid black;
    border-radius: 2px;
  }
`

// enum ComponentType {
//   MANDATORY = 'mandatory',
//   OPTIONAL = 'optional',
// }

interface DrawingLineTypeTreeProps {
  drawingTypeId: string
  drawingTypeGetAll: ReturnType<typeof api.drawingType.getAll.useQuery>
}

const DrawingLineTypeTreeDevX = ({
  drawingTypeId,
  drawingTypeGetAll,
}: DrawingLineTypeTreeProps) => {
  // router
  const router = useRouter()
  const {
    creating,
    editing,
    lineTypeId,
    componentType,
    componentId,
    count,
    editingComponent,
  } = router.query

  // states: infoOnMouseEnter
  const [infoOnMouseEnter, setInfoOnMouseEnter] =
    useState<NodeMouseEventParams>()

  // refs: colRef
  const colRef = useRef<HTMLDivElement>(null)
  // refs: editingLineTypeRef
  const editingLineTypeRef = useRef<InputRef>(null)
  // refs: editingDrawingTypeRef
  const editingDrawingTypeRef = useRef<InputRef>(null)
  // refs: creatingDrawingTypeRef
  const creatingDrawingTypeRef = useRef<InputRef>(null)

  // messageAPI
  const [messageApi, contextHolder] = message.useMessage()

  // trpcs: getAll lineTypeComponents
  const getAllLineTypes = api.lineType.getAllWithComponents.useQuery({
    drawingTypeId,
  })
  // types: create lineTypeComponent
  const createLineTypeComponent = api.lineTypeComponent.create.useMutation({
    onSuccess: () => {
      void messageApi.success('Add line type component successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()

      // reset creating
      void router.push({
        pathname: '/drawingtypes',
        query: {
          ...router.query,
          creating: undefined,
          drawingTypeId: undefined,
          componentType: undefined,
        },
      })
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: update lineTypeComponent
  const updateLineTypeComponent = api.lineTypeComponent.update.useMutation({
    onSuccess: () => {
      void messageApi.success('Update line type component successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()

      // reset editing
      void router.push({
        pathname: '/drawingtypes',
        query: {
          ...router.query,
          editing: undefined,
          lineTypeId: undefined,
          componentId: undefined,
          editingComponent: undefined,
          componentType: undefined,
          count: undefined,
        },
      })
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: delete lineTypeComponent
  const deleteLineTypeComponent = api.lineTypeComponent.delete.useMutation({
    onSuccess: () => {
      void messageApi.success('Delete line type component successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: upIndex lineTypeComponent
  const upLineTypeComponent = api.lineTypeComponent.upIndex.useMutation({
    onSuccess: () => {
      void messageApi.success('Up line type component successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: downIndex lineTypeComponent
  const downLineTypeComponent = api.lineTypeComponent.downIndex.useMutation({
    onSuccess: () => {
      void messageApi.success('Down line type component successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: duplicate lineTypeComponent
  const duplicateLineTypeComponent =
    api.lineTypeComponent.duplicate.useMutation({
      onSuccess: () => {
        void messageApi.success('Duplicate line type component successfully')

        // refetch: getDrawingType, getAllLineTypes
        void getDrawingType.refetch()
        void getAllLineTypes.refetch()
      },
      onError: (error) => {
        void messageApi.error(error.message)
      },
    })
  // trpcs: move lineTypeComponent to the same lineType
  const moveLineTypeComponentToSameLineType =
    api.lineTypeComponent.moveSameLineType.useMutation({
      onSuccess: () => {
        void messageApi.success(
          'Move line type component to the same line type successfully',
        )

        // refetch: getDrawingType, getAllLineTypes
        void getDrawingType.refetch()
        void getAllLineTypes.refetch()
      },
      onError: (error) => {
        void messageApi.error(error.message)
      },
    })
  // trpcs: move lineTypeComponent to different lineType
  const moveLineTypeComponentToDifferentLineType =
    api.lineTypeComponent.moveDifferentLineType.useMutation({
      onSuccess: () => {
        void messageApi.success(
          'Move line type component to difference line type successfully',
        )

        // refetch: getDrawingType, getAllLineTypes
        void getDrawingType.refetch()
        void getAllLineTypes.refetch()
      },
      onError: (error) => {
        void messageApi.error(error.message)
      },
    })

  // trpcs: get drawingType
  const getDrawingType = api.drawingType.getOne.useQuery({
    id: drawingTypeId,
  })

  // trpcs: update drawingType
  const updateDrawingType = api.drawingType.update.useMutation({
    onSuccess: () => {
      void messageApi.success('Update drawing type successfully')

      // refetch
      void getDrawingType.refetch()

      // reset editing
      void router.push({
        pathname: '/drawingtypes',
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
  // trpcs: delete drawingType
  const deleteDrawingType = api.drawingType.delete.useMutation({
    onSuccess: () => {
      void messageApi.success('Delete drawing type successfully')

      // refetch
      void getDrawingType.refetch()
      void drawingTypeGetAll.refetch()

      // reset editing
      void router.push({
        pathname: '/drawingtypes',
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
  // trpcs: duplicate drawingType
  const duplicateDrawingType = api.drawingType.duplicate.useMutation({
    onSuccess: () => {
      void messageApi.success('Duplicate drawing type successfully')

      // refetch
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()
      void drawingTypeGetAll.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })

  // trpcs: create lineType
  const createLineType = api.lineType.create.useMutation({
    onSuccess: () => {
      void messageApi.success('Add line type successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()

      // reset creating
      void router.push({
        pathname: '/drawingtypes',
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
  // trpcs: delete lineType
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
  // trpcs: update lineType
  const updateLineType = api.lineType.update.useMutation({
    onSuccess: () => {
      void messageApi.success('Update line type successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()

      // reset editing
      void router.push({
        pathname: '/drawingtypes',
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
  // trpcs: upIndex lineType
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
  // trpcs: downIndex lineType
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
  // trpcs: duplicate lineType
  const duplicateLineType = api.lineType.duplicate.useMutation({
    onSuccess: () => {
      void messageApi.success('Duplicate line type successfully')

      // refetch: getDrawingType, getAllLineTypes
      void getDrawingType.refetch()
      void getAllLineTypes.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: moveLineTypeToSameDrawingType
  const moveLineTypeToSameDrawingType =
    api.lineType.moveSameDrawingType.useMutation({
      onSuccess: () => {
        void messageApi.success(
          'Move line type to the same drawing type successfully',
        )

        // refetch: getDrawingType, getAllLineTypes
        void getDrawingType.refetch()
        void getAllLineTypes.refetch()
      },
      onError: (error) => {
        void messageApi.error(error.message)
      },
    })

  // trpcs: getAll Components
  const getAllComponents = api.component.getAll.useQuery()

  // Components: DrawingTypeNode
  const drawingTypeNode = () => {
    return (
      <>
        {updateDrawingType.isLoading ? (
          <LoadingOutlined />
        ) : (
          <Space align="center" size="small">
            {editing === 'drawingType' &&
            drawingTypeId === getDrawingType.data?.id ? (
              <>
                <Input
                  size="small"
                  autoFocus
                  defaultValue={getDrawingType.data?.name}
                  onPressEnter={(e) => {
                    if (!getDrawingType.data) return

                    // check if the value is the same as the current name
                    if (e.currentTarget.value === getDrawingType.data.name)
                      return

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
                        pathname: '/drawingtypes',
                        query: {
                          ...router.query,
                          editing: undefined,
                          drawingTypeId: undefined,
                        },
                      })
                    }
                  }}
                  ref={editingDrawingTypeRef}
                />
                {/* Close button */}
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => {
                    void router.push({
                      pathname: '/drawingtypes',
                      query: {
                        ...router.query,
                        editing: undefined,
                        drawingTypeId: undefined,
                      },
                    })
                  }}
                />
                {/* Update button */}
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => {
                    if (!getDrawingType.data) return

                    // check if the value is the same as the current name
                    if (
                      editingDrawingTypeRef.current?.input?.value ===
                      getDrawingType.data.name
                    )
                      return

                    // update
                    void updateDrawingType.mutate({
                      id: getDrawingType.data?.id,
                      name: editingDrawingTypeRef.current?.input?.value,
                    })
                  }}
                />
              </>
            ) : (
              <>
                <Typography.Text
                  className={cx(editTextNode)}
                  onClick={() => {
                    void router.push({
                      pathname: '/drawingtypes',
                      query: {
                        ...router.query,
                        editing: 'drawingType',
                        drawingTypeId: getDrawingType.data?.id,
                      },
                    })
                  }}>
                  {getDrawingType.data?.name}
                </Typography.Text>

                {/* onHover Buttons */}
                {/* Delete button */}
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    const drawingTypeId = getDrawingType.data?.id
                    if (!drawingTypeId) {
                      void messageApi.error('Drawing type not found')
                      return
                    }

                    // get user confirmation
                    Modal.confirm({
                      title: 'Do you want to delete this drawing type?',
                      content: `Drawing type: "${getDrawingType.data?.name}"`,
                      okText: 'Yes',
                      cancelText: 'No',
                      onOk: () => {
                        // delete
                        void deleteDrawingType.mutate({
                          id: drawingTypeId,
                        })
                      },
                    })
                  }}
                  style={{
                    visibility:
                      infoOnMouseEnter?.node.key === getDrawingType.data?.id
                        ? 'visible'
                        : 'hidden',
                  }}
                />

                {/* Duplicate button */}
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    // get user confirmation
                    Modal.confirm({
                      title: 'Enter the name of the new drawing type',
                      content: (
                        <Input
                          autoFocus
                          defaultValue={`${getDrawingType.data?.name} (copy)`}
                          ref={creatingDrawingTypeRef}
                        />
                      ),
                      okText: 'Create',
                      cancelText: 'Cancel',
                      onOk: () => {
                        if (
                          !getDrawingType.data?.id ||
                          !creatingDrawingTypeRef.current?.input?.value
                        ) {
                          void messageApi.error('Drawing type not found')
                          return
                        }

                        // duplicate
                        void duplicateDrawingType.mutate({
                          id: getDrawingType.data?.id,
                          name: creatingDrawingTypeRef.current?.input?.value,
                        })
                      },
                    })
                  }}
                  style={{
                    visibility:
                      infoOnMouseEnter?.node.key === getDrawingType.data?.id
                        ? 'visible'
                        : 'hidden',
                  }}
                />

                {/* Add button */}
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    void router.push({
                      pathname: '/drawingtypes',
                      query: {
                        ...router.query,
                        creating: 'lineType',
                        drawingTypeId: getDrawingType.data?.id,
                      },
                    })
                  }}
                  style={{
                    visibility:
                      infoOnMouseEnter?.node.key === getDrawingType.data?.id
                        ? 'visible'
                        : 'hidden',
                  }}
                />
              </>
            )}
          </Space>
        )}
      </>
    )
  }

  // Components: LineTypesNode
  const lineTypesNode = () => {
    const lineTypes = getAllLineTypes.data?.map((lineType) => ({
      title: (
        <Space
          align="center"
          size="small"
          style={{
            // subtract 24px x tree nodes
            // width: colRef.current?.offsetWidth
            //   ? colRef.current?.offsetWidth - 48
            //   : 0,
            width: 323 - 64,
          }}>
          {/* Edit button */}
          {editing === 'lineType' && lineTypeId === lineType.id ? (
            <>
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
                      pathname: '/drawingtypes',
                      query: {
                        ...router.query,
                        editing: undefined,
                        lineTypeId: undefined,
                      },
                    })
                  }
                }}
                // ref
                ref={editingLineTypeRef}
              />
              {/* Close button */}
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => {
                  void router.push({
                    pathname: '/drawingtypes',
                    query: {
                      ...router.query,
                      editing: undefined,
                      lineTypeId: undefined,
                    },
                  })
                }}
              />
              {/* Update button */}
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => {
                  // check if the value is the same as the current name
                  if (
                    editingLineTypeRef.current?.input?.value === lineType.name
                  )
                    return

                  // update
                  void updateLineType.mutate({
                    id: lineType.id,
                    name: editingLineTypeRef.current?.input?.value,
                  })
                }}
              />
            </>
          ) : (
            <>
              <Typography.Text
                className={cx(editTextNode)}
                onClick={() => {
                  void router.push({
                    pathname: '/drawingtypes',
                    query: {
                      ...router.query,
                      editing: 'lineType',
                      lineTypeId: lineType.id,
                    },
                  })
                }}>
                {lineType.name}
              </Typography.Text>
              {/* onHover Buttons */}
              <Space.Compact
                size="small"
                style={{
                  visibility:
                    infoOnMouseEnter?.node.key === lineType.id
                      ? 'visible'
                      : 'hidden',
                }}>
                {/* Up button */}
                {/* <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<CaretUpOutlined />}
                  onClick={() => {
                    void upLineType.mutate({ id: lineType.id })
                  }}
                /> */}
                {/* Down button */}
                {/* <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<CaretDownOutlined />}
                  onClick={() => {
                    void downLineType.mutate({ id: lineType.id })
                  }}
                /> */}
                {/* Delete button */}
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
                {/* Duplicate button */}
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    // get user confirmation
                    Modal.confirm({
                      title: 'Do you want to duplicate this line type?',
                      content: `Line type: "${lineType.name}"`,
                      okText: 'Yes',
                      cancelText: 'No',
                      onOk: () => {
                        // duplicate
                        void duplicateLineType.mutate({ id: lineType.id })
                      },
                    })
                  }}
                />
                {/* Add component button */}
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    // get line type components that are not in this line type
                    const components = getAllComponents.data?.filter(
                      (component) =>
                        !lineType.lineTypeComponents.some(
                          (lineTypeComponent) =>
                            lineTypeComponent.Component.id === component.id,
                        ),
                    )
                    if (!components?.[0]?.id) {
                      void messageApi.error('Components not found')
                      return
                    }

                    void router.push({
                      pathname: '/drawingtypes',
                      query: {
                        ...router.query,
                        creating: 'component',
                        lineTypeId: lineType.id,
                        componentId: components?.[0].id,
                        componentType: '1',
                        count: '1',
                      },
                    })
                  }}
                />
              </Space.Compact>
            </>
          )}
        </Space>
      ),
      key: lineType.id,
      children:
        creating === 'component' && lineTypeId === lineType.id
          ? [
              ...lineType.lineTypeComponents.map((lineTypeComponent) => ({
                title: (
                  <Typography.Text className={cx(editTextNode)}>
                    {`${lineTypeComponent.Component.name} x ${lineTypeComponent.count}`}
                  </Typography.Text>
                ),
                key: lineTypeComponent.id,
              })),
              {
                title: (
                  <Row
                    align="middle"
                    justify="space-between"
                    gutter={[4, 4]}
                    style={{
                      padding: '4px',
                    }}>
                    <Col span={24}>
                      <Space.Compact size="small">
                        <InputNumber
                          addonBefore={
                            <Select
                              size="small"
                              defaultValue="New Component"
                              autoFocus
                              value={componentId as string}
                              onChange={(value) => {
                                void router.push({
                                  pathname: '/drawingtypes',
                                  query: {
                                    ...router.query,
                                    componentId: value,
                                  },
                                })
                              }}>
                              {getAllComponents.data?.map((component) => (
                                <Select.Option
                                  key={component.id}
                                  value={component.id}>
                                  {component.name}
                                </Select.Option>
                              ))}
                            </Select>
                          }
                          size="small"
                          min={1}
                          max={20}
                          defaultValue={1}
                          onChange={(value) => {
                            void router.push({
                              pathname: '/drawingtypes',
                              query: {
                                ...router.query,
                                count: value,
                              },
                            })
                          }}
                        />
                      </Space.Compact>
                    </Col>

                    <Col span={24}>
                      <Radio.Group
                        size="small"
                        onChange={(e: RadioChangeEvent) => {
                          const componentType = String(e.target.value as string)

                          void router.push({
                            pathname: '/drawingtypes',
                            query: {
                              ...router.query,
                              componentType,
                            },
                          })
                        }}
                        value={componentType as string}>
                        {
                          // import componentType enum
                          Object.values(ComponentType).map((componentType) => (
                            <Radio key={componentType} value={componentType}>
                              {/* ComponentType with first letter is a capital */}
                              {componentType?.[0]?.toUpperCase() +
                                componentType.slice(1)}
                            </Radio>
                          ))
                        }
                      </Radio.Group>
                    </Col>

                    <Col span={24}>
                      <Space size="small">
                        <Button
                          type="text"
                          shape="circle"
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() => {
                            void router.push({
                              pathname: '/drawingtypes',
                              query: {
                                ...router.query,
                                creating: undefined,
                                lineTypeId: undefined,
                                componentType: undefined,
                              },
                            })
                          }}
                        />

                        <Button
                          type="primary"
                          shape="circle"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            const componentType =
                              String(router.query.componentType) === '1'
                                ? 'mandatory'
                                : 'optional'

                            void createLineTypeComponent.mutate({
                              lineTypeId,
                              componentId: componentId as string,
                              componentType,
                              count: Number(count),
                            })
                          }}
                        />
                      </Space>
                    </Col>
                  </Row>
                ),
                key: 'newComponent',
              },
            ]
          : [
              ...lineType.lineTypeComponents.map((lineTypeComponent) => ({
                title: (
                  <>
                    {editing === 'component' &&
                    componentId === lineTypeComponent.id &&
                    lineTypeId === lineType.id ? (
                      <>
                        <Row
                          align="middle"
                          justify="space-between"
                          gutter={[4, 4]}
                          style={{
                            padding: '4px',
                          }}>
                          <Col span={24}>
                            <Space.Compact size="small">
                              <InputNumber
                                addonBefore={
                                  <Select
                                    size="small"
                                    autoFocus
                                    defaultValue={editingComponent}
                                    value={editingComponent}
                                    onChange={(value) => {
                                      // check if there is the same component name in the line type
                                      const isSameComponentName =
                                        lineType.lineTypeComponents.some(
                                          (lineTypeComponent) =>
                                            lineTypeComponent.Component.name ===
                                            value,
                                        )
                                      if (isSameComponentName) {
                                        void messageApi.error(
                                          'There is the same component name in the line type',
                                        )
                                        return
                                      }

                                      void router.push({
                                        pathname: '/drawingtypes',
                                        query: {
                                          ...router.query,
                                          editingComponent: value,
                                        },
                                      })
                                    }}
                                    options={getAllComponents.data?.map(
                                      (component) => ({
                                        label: component.name,
                                        value: component.name,
                                        // disable if this component is already in this line type components
                                        disabled:
                                          lineType.lineTypeComponents.some(
                                            (lineTypeComponent) =>
                                              lineTypeComponent.Component
                                                .name === component.name,
                                          ),
                                      }),
                                    )}
                                  />
                                }
                                prefix="x"
                                size="small"
                                min={1}
                                max={20}
                                defaultValue={lineTypeComponent.count}
                                onChange={(value) => {
                                  void router.push({
                                    pathname: '/drawingtypes',
                                    query: {
                                      ...router.query,
                                      count: value,
                                    },
                                  })
                                }}
                                onKeyDown={(
                                  e: React.KeyboardEvent<HTMLInputElement>,
                                ) => {
                                  // check if the key is escape
                                  if (e.key === 'Escape') {
                                    // refetch
                                    void getDrawingType.refetch()

                                    // reset editing
                                    void router.push({
                                      pathname: '/drawingtypes',
                                      query: {
                                        ...router.query,
                                        editing: undefined,
                                        lineTypeId: undefined,
                                        componentId: undefined,
                                        editingComponent: undefined,
                                        componentType: undefined,
                                        count: undefined,
                                      },
                                    })
                                  }
                                }}
                              />
                            </Space.Compact>
                          </Col>

                          <Col span={24}>
                            <Radio.Group
                              size="small"
                              onChange={(e: RadioChangeEvent) => {
                                const componentType = String(
                                  e.target.value as string,
                                )

                                void router.push({
                                  pathname: '/drawingtypes',
                                  query: {
                                    ...router.query,
                                    componentType,
                                  },
                                })
                              }}
                              value={componentType as string}>
                              {
                                // import componentType enum
                                Object.values(ComponentType).map(
                                  (componentType) => (
                                    <Radio
                                      key={componentType}
                                      value={componentType}>
                                      {/* ComponentType with first letter is a capital */}
                                      {componentType?.[0]?.toUpperCase() +
                                        componentType.slice(1)}
                                    </Radio>
                                  ),
                                )
                              }
                            </Radio.Group>
                          </Col>

                          <Col span={24}>
                            <Button
                              type="text"
                              shape="circle"
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={() => {
                                void router.push({
                                  pathname: '/drawingtypes',
                                  query: {
                                    ...router.query,
                                    editing: undefined,
                                    lineTypeId: undefined,
                                    componentId: undefined,
                                    editingComponent: undefined,
                                    componentType: undefined,
                                    count: undefined,
                                  },
                                })
                              }}
                            />

                            {/* Update button */}
                            <Button
                              type="text"
                              shape="circle"
                              size="small"
                              icon={<CheckOutlined />}
                              onClick={() => {
                                const editingComponentId =
                                  getAllComponents.data?.find(
                                    (component) =>
                                      component.name === editingComponent,
                                  )?.id
                                if (!editingComponentId) {
                                  void messageApi.error('Component not found')
                                  return
                                }
                                // debugger

                                void updateLineTypeComponent.mutate({
                                  lineTypeComponentId: lineTypeComponent.id,
                                  lineTypeId: lineType.id,
                                  componentId: editingComponentId,
                                  componentType: componentType as ComponentType,
                                  count: Number(count),
                                })
                              }}
                            />
                          </Col>
                        </Row>
                      </>
                    ) : (
                      <>
                        <Typography.Text
                          className={cx(editTextNode)}
                          onClick={() => {
                            void router.push({
                              pathname: '/drawingtypes',
                              query: {
                                ...router.query,
                                editing: 'component',
                                lineTypeId: lineType.id,
                                componentId: lineTypeComponent.id,
                                editingComponent:
                                  lineTypeComponent.Component.name,
                                componentType: lineTypeComponent.componentType,
                                count: lineTypeComponent.count,
                              },
                            })
                          }}>
                          {`${lineTypeComponent.Component.name} x${lineTypeComponent.count}`}
                        </Typography.Text>

                        {/* onHover Buttons */}
                        <Space.Compact
                          size="small"
                          style={{
                            visibility:
                              infoOnMouseEnter?.node.key ===
                              lineTypeComponent.id
                                ? 'visible'
                                : 'hidden',
                          }}>
                          {/* Up button */}
                          {/* <Button
                            type="text"
                            shape="circle"
                            size="small"
                            icon={<CaretUpOutlined />}
                            onClick={() => {
                              void upLineTypeComponent.mutate({
                                lineTypeComponentId: lineTypeComponent.id,
                              })
                            }}
                          /> */}
                          {/* Down button */}
                          {/* <Button
                            type="text"
                            shape="circle"
                            size="small"
                            icon={<CaretDownOutlined />}
                            onClick={() => {
                              void downLineTypeComponent.mutate({
                                lineTypeComponentId: lineTypeComponent.id,
                              })
                            }}
                          /> */}
                          {/* Delete button */}
                          <Button
                            type="text"
                            shape="circle"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              // get user confirmation
                              Modal.confirm({
                                title: 'Do you want to delete this component?',
                                content: `Component: "${lineTypeComponent.Component.name}"`,
                                okText: 'Yes',
                                cancelText: 'No',
                                onOk: () => {
                                  // delete
                                  void deleteLineTypeComponent.mutate({
                                    lineTypeComponentId: lineTypeComponent.id,
                                  })
                                },
                              })
                            }}
                          />
                          {/* Duplicate button */}
                          <Button
                            type="text"
                            shape="circle"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => {
                              // get user confirmation
                              Modal.confirm({
                                title:
                                  'Do you want to duplicate this component?',
                                content: `Component: "${lineTypeComponent.Component.name}"`,
                                okText: 'Yes',
                                cancelText: 'No',
                                onOk: () => {
                                  // duplicate
                                  void duplicateLineTypeComponent.mutate({
                                    lineTypeComponentId: lineTypeComponent.id,
                                  })
                                },
                              })
                            }}
                          />
                        </Space.Compact>
                      </>
                    )}
                  </>
                ),
                key: lineTypeComponent.id,
              })),
            ],
    }))

    // check if lineTypes is undefined
    if (!lineTypes) return []

    return lineTypes
  }

  const treeData: DataNode[] = [
    {
      title: getDrawingType.data ? drawingTypeNode() : 'Drawing Type',
      key: getDrawingType.data?.id ?? '0',
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
                          pathname: '/drawingtypes',
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

  const allowDrop: TreeProps['allowDrop'] = ({
    dragNode,
    dropNode,
    dropPosition,
  }) => {
    console.info('dragNode', dragNode)
    console.info('dropNode', dropNode)
    console.info('dropPosition', dropPosition)

    // get drag node level
    // check if drag node is lineType
    const isLineType = getAllLineTypes.data?.some(
      (lineType) => lineType.id === dragNode.key,
    )
    // check if drag node is lineTypeComponent
    const isLineTypeComponent = getAllLineTypes.data?.some((lineType) =>
      lineType.lineTypeComponents.some(
        (lineTypeComponent) => lineTypeComponent.id === dragNode.key,
      ),
    )
    // // check if are not lineType or lineTypeComponent
    // if (!isLineType && !isLineTypeComponent) return false

    // get drop node level
    // check if drop node is lineType
    const isDropLineType = getAllLineTypes.data?.some(
      (lineType) => lineType.id === dropNode.key,
    )
    // check if drop node is lineTypeComponent
    const isDropLineTypeComponent = getAllLineTypes.data?.some((lineType) =>
      lineType.lineTypeComponents.some(
        (lineTypeComponent) => lineTypeComponent.id === dropNode.key,
      ),
    )
    // // check if drop node is drawingType
    // const isDropDrawingType = getDrawingType.data?.id === dropNode.key

    // // check if are not lineType or lineTypeComponent or drawingType
    // if (!isDropLineType && !isDropLineTypeComponent && !isDropDrawingType)
    //   return false

    // // check if drag node and drop node are the same
    // if (dragNode.key === dropNode.key) return false

    // // check if drop above the current drawingType
    // if (isDropDrawingType && dropPosition === -1) return false

    // if (isLineType && isDropDrawingType) return true

    // check if drop onTop of the same drawingType
    // if (isLineType && isDropLineType) return true

    // check if drag node and drop node are the same level
    if (isLineType && isDropLineType) return true
    if (isLineTypeComponent && isDropLineTypeComponent) return true

    // check if drag node is lineTypeComponent and drop node is lineType
    if (isLineTypeComponent && isDropLineType) return true

    // return false

    return false
  }

  // define onDrop with trpc
  const onDrop: TreeProps['onDrop'] = (info) => {
    // drag node
    const dragPos = info.dragNode.pos
    const dragPosition = info.dragNode.pos.split('-')
    const dragLevel = dragPos.split('-').length

    // drop node
    const dropPos = info.node.pos
    const dropPosition = info.node.pos.split('-')
    const dropLevel = dropPos.split('-').length

    // check if the dragPos is in 4th level (lineTypeComponent)
    if (dragLevel === 4) {
      // check if the dropPos is onTop of the same lineType
      if (
        dragPosition[0] === dropPosition[0] &&
        dragPosition[1] === dropPosition[1] &&
        dragPosition[2] === dropPosition[2]
      ) {
        // get lineTypeComponents of this lineType
        const thisLineTypeComponents = getAllLineTypes.data?.find((lineType) =>
          lineType.lineTypeComponents.some(
            (lineTypeComponent) => lineTypeComponent.id === info.dragNode.key,
          ),
        )?.lineTypeComponents
        if (!thisLineTypeComponents || thisLineTypeComponents.length === 0) {
          return void messageApi.error('Line type component not found')
        }

        // if drop onBottom of the same lineType
        if (
          dropLevel === 4 &&
          getAllLineTypes?.data &&
          Number(dropPosition[3]) === thisLineTypeComponents.length - 1
        ) {
          debugger

          const newIndex = Number(dropPos.split('-')[3]) ?? -1
          if (newIndex === -1) {
            return void messageApi.error('New index not found')
          }

          return moveLineTypeComponentToSameLineType.mutate({
            lineTypeComponentId: info.dragNode.key as string,
            newIndex,
          })
        }
        // check if the dropPos is in 4th level (lineTypeComponent) && between 2 lineTypeComponents
        else if (dropLevel === 4) {
          debugger

          let newIndex = Number(dropPos.split('-')[3]) ?? -1
          if (newIndex === -1) {
            return void messageApi.error('New index not found')
          }

          const oldIndex = Number(dragPos.split('-')[3]) ?? -1

          // check if newIndex is more than oldIndex
          if (newIndex > oldIndex) {
          } else if (newIndex < oldIndex) {
            newIndex = newIndex + 1
          }

          return moveLineTypeComponentToSameLineType.mutate({
            lineTypeComponentId: info.dragNode.key as string,
            newIndex,
          })
        }
        // check if the dropPos is onTop of the same lineType
        else if (dropLevel === 3 && info.dropToGap === false) {
          debugger

          return moveLineTypeComponentToSameLineType.mutate({
            lineTypeComponentId: info.dragNode.key as string,
            newIndex: 0,
          })
        }
        // check if the dropPos is onTop of the different lineType
        else if (dropLevel === 3) {
          debugger
          return
        }
      }
      // check if the dropPos is onTop of the different lineType
      else if (
        dragPosition[0] === dropPosition[0] &&
        dragPosition[1] === dropPosition[1] &&
        dragPosition[2] !== dropPosition[2]
      ) {
        // only level 4th drop
        if (dropLevel === 4) {
          // get lineTypeComponents of this lineType
          const dropLineTypeComponents = getAllLineTypes.data?.find(
            (lineType) =>
              lineType.lineTypeComponents.some(
                (lineTypeComponent) => lineTypeComponent.id === info.node.key,
              ),
          )?.lineTypeComponents
          if (!dropLineTypeComponents || dropLineTypeComponents.length === 0) {
            void messageApi.error('Line type component not found')
            return
          }

          const newLineTypeId = dropLineTypeComponents?.[0]?.lineTypeId
          if (!newLineTypeId) {
            void messageApi.error('New line type id not found')
            return
          }

          // if drop onBottom of the different lineType
          if (
            getAllLineTypes?.data &&
            Number(dropPosition[3]) === dropLineTypeComponents.length - 1
          ) {
            debugger

            const newIndex = Number(dropPos.split('-')[3]) ?? -1
            if (newIndex === -1) {
              void messageApi.error('New index not found')
              return
            }

            return moveLineTypeComponentToDifferentLineType.mutate({
              lineTypeComponentId: info.dragNode.key as string,
              newIndex,
              newLineTypeId,
            })
          }
          // check if the dropPos is in 4th level (lineTypeComponent) && between 2 lineTypeComponents
          else {
            debugger
            const newIndex = Number(dropPos.split('-')[3]) + 1 ?? -1
            if (newIndex === -1) {
              void messageApi.error('New index not found')
              return
            }

            return moveLineTypeComponentToDifferentLineType.mutate({
              lineTypeComponentId: info.dragNode.key as string,
              newIndex,
              newLineTypeId,
            })
          }
        }
        // only level 3rd drop
        else if (dropLevel === 3) {
          const newLineTypeId = info.node.key as string

          // check if the dropPos is onTop of the different lineType
          if (info.dropToGap === false) {
            debugger

            return moveLineTypeComponentToDifferentLineType.mutate({
              lineTypeComponentId: info.dragNode.key as string,
              newIndex: 0,
              newLineTypeId,
            })
          }
          // check if the dropPos is onTop of the different lineType
          else {
            debugger
            return moveLineTypeComponentToDifferentLineType.mutate({
              lineTypeComponentId: info.dragNode.key as string,
              newIndex: 0,
              newLineTypeId: info.node.key as string,
            })
          }
        }
      }
    }
    // check if the dragPos is in 3rd level (lineType)
    else if (dragLevel === 3) {
      // get lineTypes
      const lineTypes = getAllLineTypes.data?.find(
        (lineType) => lineType.id === info.dragNode.key,
      )
      if (!lineTypes) {
        void messageApi.error('Line types not found')
        return
      }

      // check if the dropPos is onTop of the same drawingType
      if (
        dragPosition[0] === dropPosition[0] &&
        dragPosition[1] === dropPosition[1]
      ) {
        // if drop onBottom of the same drawingType
        if (
          dropLevel === 3 &&
          getAllLineTypes?.data &&
          Number(dropPosition[2]) === getAllLineTypes.data.length - 1
        ) {
          debugger

          const newIndex = getAllLineTypes.data.length - 1
          if (newIndex === -1) {
            void messageApi.error('New index not found')
            return
          }

          return moveLineTypeToSameDrawingType.mutate({
            id: info.dragNode.key as string,
            newIndex,
          })
        }
        // check if the dropPos is in 3rd level (lineType) && between 2 lineTypes
        else if (dropLevel === 3) {
          debugger

          let newIndex = Number(dropPos.split('-')[2]) ?? -1
          if (newIndex === -1) {
            void messageApi.error('New index not found')
            return
          }

          const oldIndex = Number(dragPos.split('-')[2]) ?? -1

          // check if newIndex is more than oldIndex
          if (newIndex > oldIndex) {
          } else if (newIndex < oldIndex) {
            newIndex = newIndex + 1
          }

          return moveLineTypeToSameDrawingType.mutate({
            id: info.dragNode.key as string,
            newIndex,
          })
        }
        // check if the dropPos is onTop of the same drawingType
        else if (dropLevel === 2 && info.dropToGap === false) {
          debugger

          return moveLineTypeToSameDrawingType.mutate({
            id: info.dragNode.key as string,
            newIndex: 0,
          })
        }
        // check if the dropPos is onTop of the different drawingType
        else if (dropLevel === 2) {
          debugger
          return
        }
      }
    }
  }

  return (
    <>
      {/* messageAPI */}
      {contextHolder}

      {/* Tree */}
      <Row>
        <Col span={24} ref={colRef}>
          {getAllLineTypes.data ? (
            <Tree
              className="draggable-tree"
              draggable
              selectable={false}
              defaultExpandAll
              allowDrop={allowDrop}
              onDrop={onDrop}
              disabled={
                updateDrawingType.isLoading ||
                updateLineType.isLoading ||
                upLineType.isLoading ||
                downLineType.isLoading ||
                duplicateLineType.isLoading ||
                deleteLineType.isLoading ||
                duplicateDrawingType.isLoading ||
                deleteDrawingType.isLoading ||
                createLineType.isLoading ||
                createLineTypeComponent.isLoading ||
                updateLineTypeComponent.isLoading ||
                upLineTypeComponent.isLoading ||
                downLineTypeComponent.isLoading ||
                duplicateLineTypeComponent.isLoading ||
                deleteLineTypeComponent.isLoading ||
                moveLineTypeComponentToSameLineType.isLoading ||
                moveLineTypeComponentToDifferentLineType.isLoading ||
                moveLineTypeToSameDrawingType.isLoading
              }
              treeData={treeData}
              style={{
                width: '100%',
              }}
              onMouseEnter={(info) => {
                setInfoOnMouseEnter(info)
                return
              }}
            />
          ) : (
            <Table dataSource={[]} key={'dummyTabl'} />
          )}
        </Col>
      </Row>
    </>
  )
}

export default DrawingLineTypeTreeDevX
