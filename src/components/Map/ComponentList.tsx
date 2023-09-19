import {
  ClockCircleOutlined,
  EditOutlined,
  EllipsisOutlined,
} from '@ant-design/icons'
import { type Component } from '@prisma/client'
import {
  Button,
  Card,
  Checkbox,
  Col,
  ColorPicker,
  Input,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
  type InputRef,
} from 'antd'
import { type Color } from 'antd/es/color-picker'
import { type ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '~/utils/api'
import { someRandomEmoji } from '~/utils/emoji/someRandomEmoji'

export default function ComponentList() {
  // router
  const router = useRouter()

  // messageAPI
  const [messageApi, contextHolder] = message.useMessage()

  // states: components
  const [components, setComponents] = useState<Component[]>([])
  // states: isChanging
  const [isChanging, setIsChanging] = useState<boolean>(false)

  // refs: nameRef
  const nameRef = useRef<InputRef>(null)
  // refs: emojiRef
  const emojiRef = useRef<InputRef>(null)
  // refs: descriptionRef
  const descriptionRef = useRef<InputRef>(null)

  // effects: prevent route change
  useEffect(() => {
    const handleRouteChange = () => {
      if (isChanging) {
        // Show a confirmation dialog
        const userHasConfirmed = window.confirm(
          'You have unsaved changes, are you sure you want to leave?',
        )
        if (!userHasConfirmed) {
          // Prevent the route change
          router.events.emit('routeChangeError')
          throw 'Route change aborted.'
        }
      }
    }

    // Listen to route changes
    router.events.on('routeChangeStart', handleRouteChange)

    // Clean up the listener when the component is unmounted
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [isChanging, router.events])

  // trpcs: get all components
  const componentGetAll = api.component.getAll.useQuery(undefined, {})
  // trpcs: update all components
  const componentUpdateAll = api.component.updateAll.useMutation({
    onSuccess: () => {
      void componentGetAll.refetch()
      void messageApi.success('Components updated')
    },
    onError: () => {
      void messageApi.error('Components update failed')
    },
  })
  // trpcs: get all partx
  const partGetAll = api.component.getAllPartx.useQuery(undefined, {})
  // trpcs: update one component
  const componentUpdateOne = api.component.updateOneComponent.useMutation({
    onSuccess: () => {
      void componentGetAll.refetch()
      void messageApi.success('Component updated')
    },
    onError: () => {
      void messageApi.error('Component update failed')
    },
  })
  // trpcs: create one component version
  const componentCreateVersion = api.componentVersion.createOne.useMutation({
    onSuccess: () => {
      void componentGetAll.refetch()
      void componentVersionGetAll.refetch()
      void messageApi.success('Component version created')
    },
    onError: () => {
      void messageApi.error('Component version creation failed')
    },
  })
  // trpcs: get all component versions
  const componentVersionGetAll = api.componentVersion.getAll.useQuery(
    undefined,
    {},
  )
  // trpcs: update one component version
  const componentVersionUpdateOne = api.componentVersion.updateOne.useMutation({
    onSuccess: () => {
      void componentVersionGetAll.refetch()
      void messageApi.success('Component version updated')
    },
    onError: () => {
      void messageApi.error('Component version update failed')
    },
  })

  // handlers: submit
  const handleCreateVersion = () => {
    const name = nameRef.current?.input?.value
    const emoji = emojiRef.current?.input?.value
    const description = descriptionRef.current?.input?.value

    if (!name || !emoji) {
      void messageApi.error('Name is required')
      return
    }

    // create a new component version
    void componentCreateVersion.mutate({
      name,
      emoji,
      description,
    })
  }

  // handlers: onColorChange
  const onColorChange = useCallback(
    (index: number, color: string) => {
      const newComponents = [...components]

      // find component by index
      const component = newComponents.find(
        (component) => component.index === index,
      )

      // update color
      if (component) {
        component.color = color
      }

      // update state
      setComponents(newComponents)
      setIsChanging(true)
    },
    [components],
  )

  // effects: components
  useEffect(() => {
    if (componentGetAll.data) {
      setComponents(componentGetAll.data)
    }
  }, [componentGetAll.data])

  // effects: random emojis
  useEffect(() => {
    if (emojiRef.current?.input) {
      emojiRef.current.input.value = someRandomEmoji().join('')
    }
  }, [])

  // convert to useMemo
  const columns = useMemo<ColumnsType<Component>>(
    () => [
      {
        key: 'index',
        title: '#',
        dataIndex: 'index',
        align: 'center',
        width: 50,
      },
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        render: (text, record, index) => (
          <Row>
            <Col span={24}>
              <Typography.Title
                level={5}
                style={{
                  margin: 0,
                }}
                editable={{
                  onChange: (name) => {
                    const newComponents = [...components]

                    // find component by index
                    const component = newComponents.find(
                      (component) => component.index === index,
                    )

                    // update name
                    if (component) {
                      component.name = name
                    }

                    // update state
                    setComponents(newComponents)
                    setIsChanging(true)
                  },
                }}>
                {record.name}
              </Typography.Title>
            </Col>

            {/* Created at */}
            <Col span={12}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {`created at: ${dayjs(record.createdAt).format(
                  'YYYY.MM.DD HH:mm:ss',
                )}`}
              </Typography.Text>
            </Col>

            {/* Updated at */}
            <Col span={12} style={{ textAlign: 'right' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {`created at: ${dayjs(record.updatedAt).format(
                  'YYYY.MM.DD HH:mm:ss',
                )}`}
              </Typography.Text>
            </Col>
          </Row>
        ),
      },
      {
        key: 'description',
        title: 'Description',
        dataIndex: 'description',
        render: (text, record, index) => (
          <Typography.Text
            editable={{
              onChange: (description) => {
                const newComponents = [...components]

                // find component by index
                const component = newComponents.find(
                  (component) => component.index === index,
                )

                // update description
                if (component) {
                  component.description = description
                }

                // update state
                setComponents(newComponents)
                setIsChanging(true)
              },
            }}>
            {record.description}
          </Typography.Text>
        ),
      },
      {
        key: 'color',
        title: 'Color',
        dataIndex: 'color',
        width: 130,
        render: (text, record, index) => (
          <ColorPicker
            showText
            value={record.color}
            onChangeComplete={(color: Color) => {
              if (record.color !== color.toHexString())
                void onColorChange(index, color.toHexString())
            }}
          />
        ),
      },
      {
        key: 'partId',
        title: 'PartId',
        dataIndex: 'partId',
        width: 120,
        render: (text, record) => (
          <>
            {partGetAll?.data && partGetAll?.data?.length > 0 && (
              <Select
                defaultValue={record.partId}
                onChange={(partId) => {
                  componentUpdateOne.mutate({
                    id: record.id,
                    partId: partId,
                  })
                }}>
                <Select.Option value={null}>None</Select.Option>
                {partGetAll.data?.map((part) => (
                  <Select.Option key={part.id} value={part.id}>
                    {part.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </>
        ),
      },

      // {
      //   key: 'createdAt',
      //   title: 'Created At',
      //   dataIndex: 'createdAt',
      //   render: (text, record) => (
      //     // typography for date time
      //     <Typography.Text>
      //       {dayjs(record.createdAt).format('YYYY.MM.DD HH:mm:ss')}
      //     </Typography.Text>
      //   ),
      // },
      // {
      //   key: 'updatedAt',
      //   title: 'Updated At',
      //   dataIndex: 'updatedAt',
      //   render: (text, record) =>
      //     dayjs(record.updatedAt).format('YYYY.MM.DD HH:mm:ss'),
      // },
    ],
    [components, componentUpdateOne, onColorChange, partGetAll.data],
  )

  return (
    <>
      {contextHolder}
      <Row justify="center" align="middle" gutter={[16, 16]}>
        {/* Title */}
        <Col
          span={24}
          style={{
            textAlign: 'center',
          }}>
          <Typography.Title level={4}>Manage Components</Typography.Title>
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
              placeholder="Version 1.0"
              addonBefore="Name"
              ref={nameRef}
            />
            <Space.Compact
              style={{
                width: '100%',
              }}>
              <Input
                required
                placeholder="Some cool emojis for easy recognition"
                addonBefore="Emoji"
                ref={emojiRef}
              />
              <Button
                type="primary"
                onClick={() => {
                  const emoji = someRandomEmoji().join('')
                  if (emojiRef.current?.input)
                    emojiRef.current.input.value = emoji
                }}>
                Refresh
              </Button>
            </Space.Compact>
            <Input
              placeholder="The effectivest model"
              addonBefore="Description"
              ref={descriptionRef}
            />
            <Button type="primary" onClick={() => void handleCreateVersion()}>
              Add
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Versions: */}
        <Col span={24}>
          <Typography.Title level={5}>Versions:</Typography.Title>
        </Col>

        {/* List of versions */}
        <Col span={24}>
          {componentVersionGetAll.data?.map((componentVersion) => (
            <Card
              key={componentVersion.id}
              cover={
                <Row justify="center" align="middle">
                  <Col span={24} style={{ textAlign: 'center' }}>
                    <Typography.Title
                      level={1}
                      style={{
                        marginBottom: 0,
                      }}>
                      {componentVersion.emoji}
                    </Typography.Title>
                  </Col>
                </Row>
              }
              actions={[
                // <SettingOutlined key="setting" />,
                <Checkbox
                  key="checkbox"
                  checked={componentVersion.selected}
                  onChange={(e) => {
                    void componentVersionUpdateOne.mutate({
                      id: componentVersion.id,
                      selected: e.target.checked,
                    })
                  }}>
                  {componentVersion.selected ? '' : 'Select'}
                </Checkbox>,
                <EditOutlined
                  key="edit"
                  onClick={() => {
                    void router.push({
                      pathname: '/map',
                      query: {
                        tab: '3',
                        componentVersionId: componentVersion.id,
                      },
                    })
                  }}
                />,
                <EllipsisOutlined key="ellipsis" />,
              ]}
              style={{ width: 300 }}>
              <Card.Meta
                title={componentVersion.name}
                description={
                  <>
                    {componentVersion.description}
                    <br />
                    <br />
                    <ClockCircleOutlined /> &nbsp;
                    {dayjs(componentVersion.createdAt).format(
                      'YYYY.MM.DD HH:mm:ss',
                    )}
                  </>
                }
              />
            </Card>
          ))}
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Components: */}
        <Col span={12}>
          <Typography.Title level={5}>Components:</Typography.Title>
        </Col>
        <Col
          span={12}
          style={{
            display: 'flex',
            flexDirection: 'row-reverse',
          }}>
          <Space>
            <Button
              type="default"
              onClick={() => {
                void componentGetAll.refetch()
                setIsChanging(false)
              }}>
              Refresh
            </Button>
            <Button
              type="primary"
              disabled={!isChanging}
              onClick={() => {
                void componentUpdateAll.mutate(components)
              }}>
              Update
            </Button>
          </Space>
        </Col>

        {/* Table of components */}
        <Col span={24}>
          <Table
            sticky
            size="small"
            columns={columns}
            dataSource={components}
            pagination={{ pageSize: 50 }}
          />
        </Col>
      </Row>
    </>
  )
}
