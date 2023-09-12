import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  message,
  type InputRef,
} from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { api } from '~/utils/api'
import LineTypeTree from './LineTypeTree'
import LineTypeComponentTree from './LineTypeComponentTree'

export const LineType = () => {
  // routers
  const router = useRouter()
  const { tab, edit, id, drawingTypeId } = router.query

  // hooks
  const nameRef = useRef<InputRef>(null)
  const descriptionRef = useRef<InputRef>(null)
  const editNameRef = useRef<InputRef>(null)
  const editDescriptionRef = useRef<InputRef>(null)

  // messages
  const [messageApi, contextHolder] = message.useMessage()

  // trpcs: get
  const drawingTypeGetAll = api.drawingType.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })
  const lineTypeGetAll = api.lineType.getAll.useQuery(
    {
      drawingTypeId: drawingTypeId as string,
    },
    {
      enabled: !!drawingTypeId,
      refetchOnWindowFocus: false,
    },
  )
  // trpcs: create
  const lineTypeCreate = api.lineType.create.useMutation({
    onSuccess: () => {
      void messageApi.success('Create line type successfully')
      void lineTypeGetAll.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: update
  const lineTypeUpdate = api.lineType.update.useMutation({
    onSuccess: () => {
      void messageApi.success('Update line type successfully')
      void lineTypeGetAll.refetch()

      void router.push({
        pathname: '/map',
        query: {
          tab,
          drawingTypeId: drawingTypeId as string,
        },
      })
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: delete
  const lineTypeDelete = api.lineType.delete.useMutation({
    onSuccess: () => {
      void messageApi.success('Delete line type successfully')
      void lineTypeGetAll.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })

  // handlers: submit
  const handleSubmit = () => {
    if (!nameRef.current?.input?.value) {
      void messageApi.error('Name is required')
      return
    }

    void lineTypeCreate.mutate({
      name: nameRef.current?.input?.value,
      description: descriptionRef.current?.input?.value,
      drawingTypeId: drawingTypeId as string,
    })
  }

  // effects: redirect
  useEffect(() => {
    const storageDrawingTypeId = localStorage.getItem('drawingTypeId')
    if (storageDrawingTypeId) {
      void router.push({
        pathname: '/map',
        query: {
          tab,
          drawingTypeId: storageDrawingTypeId,
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  return (
    <>
      {contextHolder}
      <Row justify="center" align="middle" gutter={[16, 16]}>
        {/* Add a new line type */}
        <Col
          span={24}
          style={{
            textAlign: 'center',
          }}>
          <Typography.Title level={4}>Manage Line Type Map</Typography.Title>
        </Col>

        {/* Input for a new line type */}
        <Col
          span={24}
          style={{
            textAlign: 'center',
          }}>
          <Space direction="vertical">
            {/* Select list for drawing type */}
            <Select
              loading={drawingTypeGetAll.isFetching}
              value={
                drawingTypeId ?? drawingTypeGetAll?.data?.[0]?.id ?? undefined
              }
              style={{ width: 240 }}
              onChange={(value) => {
                localStorage.setItem('drawingTypeId', value as string)

                void router.push({
                  pathname: '/map',
                  query: {
                    tab,
                    drawingTypeId: value,
                  },
                })
              }}>
              {drawingTypeGetAll?.data?.map((drawingType) => (
                <Select.Option value={drawingType.id} key={drawingType.id}>
                  {drawingType.name}
                </Select.Option>
              ))}
            </Select>

            <Input placeholder="115kV" addonBefore="Name" ref={nameRef} />
            <Input
              placeholder="The main line type for every 115/22kV substation"
              addonBefore="Description"
              ref={descriptionRef}
            />
            <Button type="primary" onClick={() => void handleSubmit()}>
              Add
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* List of drawing types */}
        <Col span={24}>
          <Typography.Title level={4}>List of line types</Typography.Title>
        </Col>

        {lineTypeGetAll.isFetching && <Col span={24}>Loading...</Col>}
        {!lineTypeGetAll.isFetching && (
          <>
            {lineTypeGetAll?.data && lineTypeGetAll?.data?.length > 0 ? (
              lineTypeGetAll.data.map((lineType) => (
                <Col span={6} key={lineType.id}>
                  <Card
                    title={lineType.name}
                    extra={
                      <Button
                        type="text"
                        onClick={() => {
                          void router.push({
                            pathname: '/map',
                            query: {
                              tab,
                              edit: 'true',
                              id: lineType.id,
                              drawingTypeId: drawingTypeId as string,
                            },
                          })
                        }}>
                        Edit
                      </Button>
                    }>
                    <Typography.Text>{lineType.description}</Typography.Text>

                    {/* LineTypeComponentTree */}
                    <LineTypeComponentTree lineTypeId={lineType.id} />
                  </Card>
                  <Modal
                    title="Edit drawing type"
                    open={edit === 'true' && id === lineType.id}
                    destroyOnClose
                    onCancel={() => {
                      void router.push({
                        pathname: '/map',
                        query: {
                          tab,
                          drawingTypeId: drawingTypeId as string,
                        },
                      })
                    }}
                    footer={[
                      <Button
                        key="delete"
                        danger
                        type="text"
                        onClick={() => {
                          window.confirm(
                            'Are you sure you want to delete this line type?',
                          ) &&
                            void lineTypeDelete.mutate({
                              id: lineType.id,
                            })
                        }}>
                        Delete
                      </Button>,
                      <Button
                        key="cancel"
                        onClick={() => {
                          void router.push({
                            pathname: '/map',
                            query: {
                              tab,
                            },
                          })
                        }}>
                        Cancel
                      </Button>,
                      <Button
                        key="submit"
                        type="primary"
                        onClick={() => {
                          lineTypeUpdate.mutate({
                            id: lineType.id,
                            name: editNameRef.current?.input?.value,
                            description:
                              editDescriptionRef.current?.input?.value,
                          })
                        }}>
                        Update
                      </Button>,
                    ]}>
                    <Row justify="center" align="middle" gutter={[16, 16]}>
                      <Col span={24}>
                        <Space direction="vertical">
                          <Input
                            placeholder="Main & Transfer"
                            addonBefore="Name"
                            defaultValue={lineType.name}
                            ref={editNameRef}
                          />
                          <Input
                            placeholder="The most popular drawing type map of electrical power substation"
                            addonBefore="Description"
                            defaultValue={lineType.description ?? ''}
                            ref={editDescriptionRef}
                          />
                        </Space>
                      </Col>

                      <Col span={24}></Col>

                      <Col span={24}>
                        <LineTypeTree />
                      </Col>
                    </Row>
                  </Modal>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Typography.Text>None</Typography.Text>
              </Col>
            )}
          </>
        )}
      </Row>
    </>
  )
}
