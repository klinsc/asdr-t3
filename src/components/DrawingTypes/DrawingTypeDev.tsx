import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Space,
  Typography,
  message,
  type InputRef,
} from 'antd'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { api } from '~/utils/api'
import DrawingLineTypeTreeDev from './DrawingLineTypeTreeDev'

export const DrawingTypeDev = () => {
  // router
  const router = useRouter()
  const { tab, edit, id } = router.query

  // hooks
  const nameRef = useRef<InputRef>(null)
  const descriptionRef = useRef<InputRef>(null)
  const editNameRef = useRef<InputRef>(null)
  const editDescriptionRef = useRef<InputRef>(null)

  // messageAPI
  const [messageApi, contextHolder] = message.useMessage()

  // trpcs
  const drawingTypeCreate = api.drawingType.create.useMutation({
    onSuccess: () => {
      void messageApi.success('Create drawing type successfully')

      // reset input
      if (nameRef.current?.input?.value) nameRef.current.input.value = ''
      if (descriptionRef.current?.input?.value)
        descriptionRef.current.input.value = ''

      // refetch
      void drawingTypeGetAll.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  const drawingTypeGetAll = api.drawingType.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })
  const drawingTypeUpdate = api.drawingType.update.useMutation({
    onSuccess: () => {
      void messageApi.success('Update drawing type successfully')

      // reset input
      if (editNameRef.current?.input?.value)
        editNameRef.current.input.value = ''
      if (editDescriptionRef.current?.input?.value)
        editDescriptionRef.current.input.value = ''

      // refetch
      void drawingTypeGetAll.refetch()

      // redirect
      void router.push({
        pathname: '/drawingtypes',
        query: {
          tab,
        },
      })
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  const drawingTypeDelete = api.drawingType.delete.useMutation({
    onSuccess: () => {
      void messageApi.success('Delete drawing type successfully')

      // refetch
      void drawingTypeGetAll.refetch()

      // redirect
      void router.push({
        pathname: '/drawingtypes',
        query: { tab },
      })
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })

  // handlers
  const handleSubmit = () => {
    if (!nameRef?.current?.input?.value)
      return messageApi.error('Please fill in all fields')
    const name = nameRef?.current?.input.value
    const description = descriptionRef?.current?.input?.value

    drawingTypeCreate.mutate({
      name,
      description,
    })
  }

  // handlers: add a new drawing type
  const handleAdd = () => {
    void router.push({
      pathname: '/drawingtypes',
      query: {
        ...router.query,
        add: 'true',
      },
    })
  }

  return (
    <>
      {contextHolder}
      <Row gutter={[16, 16]} align={'top'} justify={'start'}>
        {/* Add a new predicting server */}
        <Col
          span={24}
          style={{
            textAlign: 'right',
          }}>
          <Button type="primary" onClick={() => void handleAdd()}>
            Add
          </Button>
        </Col>

        {/* List of drawing types */}
        <>
          {drawingTypeGetAll?.data && drawingTypeGetAll?.data?.length > 0 ? (
            drawingTypeGetAll.data.map((drawingType) => (
              <Col span={8} key={drawingType.id}>
                <Card>
                  {/* A line type tree of this drawing type */}
                  <DrawingLineTypeTreeDev
                    drawingTypeId={drawingType.id}
                    drawingTypeGetAll={drawingTypeGetAll}
                  />
                </Card>

                {/* Edit modal */}
                <Modal
                  title="Edit drawing type"
                  open={edit === 'true' && id === drawingType.id}
                  destroyOnClose
                  onCancel={() => {
                    void router.push({
                      pathname: '/drawingtypes',
                      query: {
                        tab,
                      },
                    })
                  }}
                  // Footer buttons
                  footer={[
                    <Button
                      key="delete"
                      danger
                      type="text"
                      onClick={() => {
                        window.confirm(
                          'Are you sure you want to delete this drawing type?',
                        ) &&
                          void drawingTypeDelete.mutate({
                            id: drawingType.id,
                          })
                      }}>
                      Delete
                    </Button>,
                    <Button
                      key="cancel"
                      onClick={() => {
                        void router.push({
                          pathname: '/drawingtypes',
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
                        drawingTypeUpdate.mutate({
                          id: drawingType.id,
                          name: editNameRef.current?.input?.value,
                          description: editDescriptionRef.current?.input?.value,
                        })
                      }}>
                      Update
                    </Button>,
                  ]}>
                  {/* Edit modal content */}
                  <Space direction="vertical">
                    <Input
                      placeholder="Main & Transfer"
                      addonBefore="Name"
                      defaultValue={drawingType.name}
                      ref={editNameRef}
                    />
                    <Input
                      placeholder="The most popular drawing type map of electrical power substation"
                      addonBefore="Description"
                      defaultValue={drawingType.description ?? ''}
                      ref={editDescriptionRef}
                    />
                  </Space>
                </Modal>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Typography.Text>No drawing types</Typography.Text>
            </Col>
          )}
        </>
      </Row>
    </>
  )
}
