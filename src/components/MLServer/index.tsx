import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  Row,
  Space,
  Typography,
  message,
  type InputRef,
  Modal,
} from 'antd'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import { api } from '~/utils/api'

export default function MLServer() {
  // router
  const router = useRouter()
  const { edit, id } = router.query

  // hooks
  const nameRef = useRef<InputRef>(null)
  const descriptionRef = useRef<InputRef>(null)
  const urlRef = useRef<InputRef>(null)
  const editNameRef = useRef<InputRef>(null)
  const editDescriptionRef = useRef<InputRef>(null)
  const editUrlRef = useRef<InputRef>(null)

  // trpcs: get all servers
  const serverGetAll = api.mlServer.getAll.useQuery(undefined, {})
  // trpcs: create a new server
  const serverCreate = api.mlServer.create.useMutation({
    onSuccess: () => {
      void serverGetAll.refetch()
      void message.success('Server created')
    },
    onError: () => {
      void message.error('Server creation failed')
    },
  })
  // trpcs: select a server
  const serverSelect = api.mlServer.select.useMutation({
    onSuccess: () => {
      void serverGetAll.refetch()
      void message.success('Server selected')
    },
    onError: () => {
      void message.error('Server update failed')
    },
  })
  // trpcs: update a server
  const serverUpdate = api.mlServer.update.useMutation({
    onSuccess: () => {
      void serverGetAll.refetch()
      void message.success('Server updated')
    },
    onError: () => {
      void message.error('Server update failed')
    },
  })
  // trpcs: delete a server
  const serverDelete = api.mlServer.delete.useMutation({
    onSuccess: () => {
      void serverGetAll.refetch()
      void message.success('Server deleted')
    },
    onError: () => {
      void message.error('Server deletion failed')
    },
  })

  // handlers
  const handleSubmit = () => {
    if (!urlRef?.current?.input?.value || !nameRef?.current?.input?.value)
      return message.error('Please fill in all fields')
    const url = urlRef?.current?.input.value
    const name = nameRef?.current?.input.value

    serverCreate.mutate({
      url,
      name,
    })
  }
  const handleSelect = (id: string) => {
    void serverSelect.mutate({
      id,
      selected: true,
    })
  }

  return (
    <Card
      title={
        <Typography.Title level={4}>Machine Learning Server</Typography.Title>
      }>
      <Row justify="center" align="middle" gutter={[16, 16]}>
        {/* Add a new predicting server */}
        <Col
          span={24}
          style={{
            textAlign: 'center',
          }}>
          <Typography.Title level={4}>
            Add a new predicting server
          </Typography.Title>
        </Col>

        {/* Input for a new server*/}
        <Col
          span={24}
          style={{
            textAlign: 'center',
          }}>
          <Space direction="vertical">
            <Input
              required
              placeholder="Machine Learning"
              addonBefore="Name"
              ref={nameRef}
            />
            <Input
              placeholder="A server for machine learning"
              addonBefore="Description"
              ref={descriptionRef}
            />
            <Input
              required
              placeholder="http://localhost:5000/"
              addonBefore="URL"
              ref={urlRef}
            />
            <Button type="primary" onClick={() => void handleSubmit()}>
              Add
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* List of servers */}
        <Col span={24}>
          <Typography.Title level={5}>
            Machine leaning servers:
          </Typography.Title>
        </Col>

        {serverGetAll.isFetching && <Col span={24}>Loading...</Col>}
        {!serverGetAll.isFetching && (
          <>
            {serverGetAll?.data && serverGetAll?.data?.length > 0 ? (
              serverGetAll.data.map((server) => (
                <Col span={6} key={server.id}>
                  <Card
                    title={
                      server.selected ? (
                        <Badge dot status={server.status} offset={[0, 5]}>
                          {server.name}
                        </Badge>
                      ) : (
                        <>server.name</>
                      )
                    }
                    extra={
                      <Button
                        type="default"
                        onClick={() => {
                          void router.push({
                            pathname: '/server',
                            query: {
                              edit: 'true',
                              id: server.id,
                            },
                          })
                        }}>
                        Edit
                      </Button>
                    }>
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Typography.Text>{server.url}</Typography.Text>
                      </Col>

                      <Col span={24}>
                        <Typography.Paragraph>
                          {server.description}
                        </Typography.Paragraph>
                      </Col>
                      <Col
                        span={24}
                        style={{
                          display: 'flex',
                          justifyContent: 'end',
                        }}>
                        <Checkbox
                          checked={server.selected}
                          onChange={() => void handleSelect(server.id)}>
                          {server.selected ? 'Selected' : 'Select'}
                        </Checkbox>
                      </Col>
                    </Row>
                  </Card>

                  {/* Edit modal */}
                  <Modal
                    title="Edit drawing type"
                    open={edit === 'true' && id === server.id}
                    destroyOnClose
                    onCancel={() => {
                      void router.push({
                        pathname: '/server',
                        query: {},
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
                            void serverDelete.mutate({
                              id: server.id,
                            })
                        }}>
                        Delete
                      </Button>,
                      <Button
                        key="cancel"
                        onClick={() => {
                          void router.push({
                            pathname: '/server',
                            query: {},
                          })
                        }}>
                        Cancel
                      </Button>,
                      <Button
                        key="submit"
                        type="primary"
                        onClick={() => {
                          void serverUpdate.mutate({
                            id: server.id,
                            name: editNameRef.current?.input?.value,
                            description:
                              editDescriptionRef.current?.input?.value,
                            url: editUrlRef.current?.input?.value,
                          })
                        }}>
                        Update
                      </Button>,
                    ]}>
                    {/* Edit modal content */}
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Input
                          placeholder="Digitalocean server"
                          addonBefore="Name"
                          defaultValue={server.name}
                          ref={editNameRef}
                        />
                      </Col>
                      <Col span={24}>
                        <Input
                          placeholder="The most popular vms in the world"
                          addonBefore="Description"
                          defaultValue={server.description ?? ''}
                          ref={editDescriptionRef}
                        />
                      </Col>
                      <Col span={24}>
                        <Input
                          placeholder="A server for digitalocean"
                          addonBefore="URL"
                          defaultValue={server.url ?? ''}
                          ref={editUrlRef}
                        />
                      </Col>
                    </Row>
                  </Modal>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Typography.Text>No servers</Typography.Text>
              </Col>
            )}
          </>
        )}
      </Row>
    </Card>
  )
}
