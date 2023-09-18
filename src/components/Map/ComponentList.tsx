import { type Component } from '@prisma/client'
import {
  Button,
  Col,
  ColorPicker,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import { type Color } from 'antd/es/color-picker'
import { type ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { api } from '~/utils/api'

export default function ComponentList() {
  // router
  const router = useRouter()

  // messageAPI
  const [messageApi, contextHolder] = message.useMessage()

  // states: components
  const [components, setComponents] = useState<Component[]>([])
  // states: isChanging
  const [isChanging, setIsChanging] = useState<boolean>(false)

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

  // handlers: onColorChange
  const onColorChange = (index: number, color: string) => {
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
  }

  // effects: components
  useEffect(() => {
    if (componentGetAll.data) {
      setComponents(componentGetAll.data)
    }
  }, [componentGetAll.data])

  // const: columns
  const columns: ColumnsType<Component> = [
    {
      key: 'index',
      title: 'Index',
      dataIndex: 'index',
    },
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      render: (text, record, index) => (
        <Typography.Text
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
        </Typography.Text>
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
      width: 50,
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

    {
      key: 'createdAt',
      title: 'Created At',
      dataIndex: 'createdAt',
      render: (text, record) =>
        dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      key: 'updatedAt',
      title: 'Updated At',
      dataIndex: 'updatedAt',
      render: (text, record) =>
        dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
    },
  ]

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
          <Typography.Title level={4}>Update Components</Typography.Title>
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
            columns={columns}
            dataSource={components}
            pagination={{ pageSize: 50 }}
          />
        </Col>
      </Row>
    </>
  )
}
