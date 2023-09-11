import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  message,
  Row,
  Space,
  Typography,
  type InputRef,
} from 'antd'
import type { PresetStatusColorType } from 'antd/es/_util/colors'
import Head from 'next/head'
import { useRef } from 'react'
import Layout from '~/components/Layout'
import { api } from '~/utils/api'

export default function Home() {
  // hooks
  const urlRef = useRef<InputRef>(null)
  const nameRef = useRef<InputRef>(null)

  // trpcs
  const serverGetAll = api.server.getAll.useQuery()
  const serverCreate = api.server.create.useMutation({
    onSuccess: () => {
      void serverGetAll.refetch()
      void message.success('Server created')
    },
    onError: () => {
      void message.error('Server creation failed')
    },
  })
  const serverSelect = api.server.select.useMutation({
    onSuccess: () => {
      void serverGetAll.refetch()
      void message.success('Server selected')
    },
    onError: () => {
      void message.error('Server update failed')
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
    <Layout>
      <Head>
        <title>ASDR: Machine Learning Server</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Row justify="center" align="middle">
        {/* Title */}
        <Col span={24}>
          <Typography.Title level={4}>Machine Learning Server</Typography.Title>
        </Col>
      </Row>

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
              placeholder="http://localhost:5000/"
              addonBefore="URL"
              ref={urlRef}
            />
            <Input
              placeholder="Machine Learning"
              addonBefore="Name"
              ref={nameRef}
            />
            <Button type="primary" onClick={() => void handleSubmit()}>
              Submit
            </Button>
          </Space>
        </Col>
      </Row>

      <Row justify="center" align="middle" gutter={[16, 16]}>
        {/* List of servers */}
        <Col span={24}>
          <Typography.Title level={4}>List of servers</Typography.Title>
        </Col>

        {serverGetAll.isFetching && <Col span={24}>Loading...</Col>}
        {!serverGetAll.isFetching && (
          <>
            {serverGetAll?.data && serverGetAll?.data?.length > 0 ? (
              serverGetAll.data.map((server) => (
                <Col span={6} key={server.id}>
                  <Card
                    style={{ width: 300 }}
                    title={server.name}
                    extra={
                      <Checkbox
                        checked={server.selected}
                        onChange={() => void handleSelect(server.id)}>
                        Select
                      </Checkbox>
                    }>
                    <Badge
                      status={server.status as PresetStatusColorType}
                      text={server.url}
                    />
                  </Card>
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
    </Layout>
  )
}
