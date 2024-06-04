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
  Dropdown,
  Form,
  Input,
  type MenuProps,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
  type FormInstance,
  type InputRef,
} from 'antd'
import { type Color } from 'antd/es/color-picker'
import { type ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '~/utils/api'
import { someRandomEmoji } from '~/utils/emoji/someRandomEmoji'

export interface Label {
  index: number
  label: string
  color: string
}

export default function ComponentList() {
  // router
  const router = useRouter()
  const { edit, componentVersionId, componentId, remove } = router.query

  // session
  const { data: session } = useSession()

  // messageAPI
  const [messageApi, contextHolder] = message.useMessage()

  // states: components
  const [components, setComponents] = useState<Component[]>([])
  // states: isChanging
  const [isChanging, setIsChanging] = useState<boolean>(false)
  // states: file
  const [file, setFile] = useState<File>()
  // states: labels
  const [labels, setLabels] = useState<Label[]>([])

  // refs: formRef
  const formRef = useRef<FormInstance>(null)
  // refs: nameRef
  const nameRef = useRef<InputRef>(null)
  // refs: emojiRef
  const emojiRef = useRef<InputRef>(null)
  // refs: descriptionRef
  const descriptionRef = useRef<InputRef>(null)

  // refs: editNameRef
  const editNameRef = useRef<InputRef>(null)
  // refs: editEmojiRef
  const editEmojiRef = useRef<InputRef>(null)
  // refs: editDescriptionRef
  const editDescriptionRef = useRef<InputRef>(null)

  // trpcs: components, get all
  const componentGetAll = api.component.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })
  // trpcs: components, update all
  const componentUpdateAll = api.component.updateAll.useMutation({
    onSuccess: () => {
      void componentGetAll.refetch()
      void messageApi.success('Components updated')
    },
    onError: () => {
      void messageApi.error('Components update failed')
    },
  })
  // trpcs: components, get all part
  const partGetAll = api.component.getAllPartx.useQuery(undefined, {})
  // trpcs: component, update one
  const componentUpdateOne = api.component.updateOneComponent.useMutation({
    onSuccess: () => {
      void componentGetAll.refetch()
      void messageApi.success('Component updated')
    },
    onError: () => {
      void messageApi.error('Component update failed')
    },
  })
  // trpcs: version, create one
  const componentVersionCreateOne = api.componentVersion.createOne.useMutation({
    onSuccess: async () => {
      await componentGetAll.refetch()
      await componentVersionGetAll.refetch()
      await messageApi.success('Component version created')

      // discard refs & file
      if (nameRef.current?.input) nameRef.current.input.value = ''
      if (emojiRef.current?.input) emojiRef.current.input.value = ''
      if (descriptionRef.current?.input) descriptionRef.current.input.value = ''
      setFile(undefined)
      setLabels([])
    },
    onError: () => {
      void messageApi.error('Component version creation failed')
    },
  })
  // trpcs: version, get all
  const componentVersionGetAll = api.componentVersion.getAll.useQuery(
    undefined,
    {},
  )
  // trpcs: version, update one
  const componentVersionUpdateOne = api.componentVersion.updateOne.useMutation({
    onSuccess: () => {
      void componentVersionGetAll.refetch()
      void messageApi.success('Component version updated')
    },
    onError: () => {
      void messageApi.error('Component version update failed')
    },
  })
  // trpcs: version, delete one
  const componentVersionDeleteOne = api.componentVersion.deleteOne.useMutation({
    onSuccess: () => {
      void componentVersionGetAll.refetch()
      void messageApi.success('Component version deleted')
    },
    onError: () => {
      void messageApi.error('Component version deletion failed')
    },
  })

  // handlers: submit
  const handleCreateVersion = () => {
    //debugger
    const name = nameRef.current?.input?.value
    const emoji = emojiRef.current?.input?.value
    const description = descriptionRef.current?.input?.value

    if (!name || !emoji) {
      void messageApi.error('Name is required')
      return
    }

    // create a new component version
    void componentVersionCreateOne.mutate({
      name,
      emoji,
      description,
      labels,
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
      setIsChanging(false)
    }
  }, [componentGetAll.data])

  // // effects: random emojis
  // useEffect(() => {
  //   if (emojiRef.current?.input) {
  //     emojiRef.current.input.value = someRandomEmoji().join('')
  //   }
  // }, [])

  // convert to useMemo
  const columns: ColumnsType<Component> = [
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
      width: 200,
      render: (text, record, index) => (
        <Row>
          <Col span={24}>
            <Typography.Title
              level={5}
              style={{
                margin: 0,
              }}
              editable={
                edit === 'true' &&
                componentId === record.id && {
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
                }
              }>
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
    ...(session?.user?.role === 'ADMIN'
      ? ([
          {
            key: 'description',
            title: 'Description',
            dataIndex: 'description',
            // hide this column if edit mode is not enabled
            render: (text, record, index) => (
              <>
                {session?.user?.role === 'ADMIN' && (
                  <Typography.Text
                    editable={
                      edit === 'true' &&
                      componentId === record.id && {
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
                      }
                    }>
                    {record.description}
                  </Typography.Text>
                )}
              </>
            ),
          },
        ] as ColumnsType<Component>)
      : []),
    {
      key: 'color',
      title: 'Color',
      dataIndex: 'color',
      width: 130,
      render: (text, record, index) => (
        <ColorPicker
          disabled={edit !== 'true' || componentId !== record.id}
          showText
          value={record.color}
          onChangeComplete={(color: Color) => {
            if (record.color !== color.toHexString())
              void onColorChange(index, color.toHexString())
          }}
        />
      ),
    },
    ...(session?.user?.role === 'ADMIN'
      ? ([
          {
            key: 'partId',
            title: 'PartId',
            dataIndex: 'partId',
            width: 120,
            render: (text, record) => (
              <>
                {partGetAll?.data && partGetAll?.data?.length > 0 && (
                  <Select
                    disabled={edit !== 'true' || componentId !== record.id}
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
        ] as ColumnsType<Component>)
      : []),

    ...(session?.user?.role === 'ADMIN'
      ? ([
          {
            key: 'actions',
            title: 'Actions',
            dataIndex: 'actions',
            width: 200,
            // width:
            //   edit === 'true' && componentId && componentId?.length > 0 ? 200 : 100,
            align: 'center',
            render: (text, record, index) => (
              <Space.Compact>
                {/* Edit button */}
                {componentId !== record.id && (
                  <Button
                    type="default"
                    onClick={() => {
                      const handleEdit = async () => {
                        // alert if there are unsaved changes
                        if (isChanging) {
                          // Show a confirmation dialog
                          const userHasConfirmed = window.confirm(
                            'You have unsaved changes, are you sure you want to leave?',
                          )
                          if (!userHasConfirmed) {
                            return
                          }
                        }

                        // discard changes
                        await componentGetAll.refetch()

                        await router.push(
                          {
                            pathname: '/drawingtypes',
                            query: {
                              ...router.query,
                              edit: 'true',
                              componentId: record.id,
                            },
                          },
                          undefined,
                          {
                            scroll: false,
                          },
                        )
                      }
                      void handleEdit()
                    }}>
                    Edit
                  </Button>
                )}

                {/* Cancel button */}
                {edit === 'true' && componentId === record.id && (
                  <Button
                    type="default"
                    onClick={() => {
                      // discard changes
                      void componentGetAll.refetch()

                      // clear edit mode
                      void router.push(
                        {
                          pathname: '/drawingtypes',
                          query: {
                            ...router.query,
                            edit: undefined,
                            componentId: undefined,
                          },
                        },
                        undefined,
                        {
                          scroll: false,
                        },
                      )
                    }}>
                    Cancel
                  </Button>
                )}

                {/* Save button */}
                {edit === 'true' && componentId === record.id && (
                  <Button
                    disabled={!isChanging}
                    type="primary"
                    onClick={() => {
                      const component = components.find(
                        (component) => component.index === index,
                      )
                      if (!component) return

                      void componentUpdateOne.mutate({
                        id: component.id,
                        name: component.name,
                        description: component.description,
                        color: component.color,
                        partId: component.partId,
                      })

                      void router.push(
                        {
                          pathname: '/drawingtypes',
                          query: {
                            ...router.query,
                            edit: undefined,
                            componentId: undefined,
                          },
                        },
                        undefined,
                        {
                          scroll: false,
                        },
                      )
                    }}>
                    Save
                  </Button>
                )}
              </Space.Compact>
            ),
          },
        ] as ColumnsType<Component>)
      : []),
  ]

  // const: preview columns
  const previewColumns: ColumnsType<Label> = [
    {
      key: 'index',
      title: '#',
      dataIndex: 'index',
      align: 'center',
      width: 50,
    },
    {
      key: 'label',
      title: 'Label',
      dataIndex: 'label',
      render: (text, record) => (
        <Typography.Text>{record.label}</Typography.Text>
      ),
    },
    {
      key: 'color',
      title: 'Color',
      dataIndex: 'color',
      render: (text, record) => <ColorPicker value={record.color} showText />,
    },
  ]

  // const: menu items
  const items: MenuProps['items'] = [
    {
      label: (
        <a
          onClick={(e) => {
            e.preventDefault()

            if (
              window.confirm(
                'Are you sure you want to delete this drawing type?',
              ) &&
              remove === 'true'
            )
              void componentVersionDeleteOne.mutate({
                id: componentVersionId as string,
              })
          }}>
          Delete
        </a>
      ),
      key: '0',
    },
  ]

  return (
    <>
      {contextHolder}
      {session?.user?.role === 'ADMIN' && (
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
            <Form ref={formRef}>
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
                    defaultValue={someRandomEmoji().join('')}
                  />
                  <Button
                    type="primary"
                    onClick={() => {
                      const emoji = someRandomEmoji().join('')
                      if (emojiRef.current?.input)
                        emojiRef.current.input.value = emoji
                    }}>
                    Generate
                  </Button>
                </Space.Compact>
                <Input
                  placeholder="The effectivest model"
                  addonBefore="Description"
                  ref={descriptionRef}
                />

                {/* File input */}
                <Input
                  type="file"
                  accept=".xml"
                  onChange={(e) => {
                    //debugger
                    const file = e.target?.files?.[0]
                    if (!file) return

                    const reader = new FileReader()
                    reader.onload = (e) => {
                      //debugger
                      const xml = e.target?.result as string
                      console.log(xml)

                      const lines = e.target?.result?.toString().split('\n')
                      if (!lines) return

                      const newLabels: Label[] = []
                      for (let i = 0; i < lines.length; i++) {
                        const line = lines[i]
                        if (!line) continue

                        const label = line.match(/value="(.+?)"/)?.[1]
                        const color = line.match(/background="(.+?)"/)?.[1]

                        if (!label || !color) continue

                        newLabels.push({
                          index: i,
                          label,
                          color,
                        })
                      }

                      // rearrange index of labels, start from 0
                      for (let i = 0; i < newLabels.length; i++) {
                        const label = newLabels[i]
                        if (!label) continue

                        label.index = i
                      }

                      setLabels(newLabels)
                    }

                    reader.readAsText(file)

                    setFile(file)
                  }}
                />

                {/* File preview */}
                {file && (
                  <Typography.Text>
                    {file.name} ({file.size} bytes)
                  </Typography.Text>
                )}

                {/* Labels preview */}
                {labels.length > 0 && (
                  <Table
                    size="small"
                    columns={previewColumns}
                    dataSource={labels}
                    pagination={{ pageSize: 20 }}
                  />
                )}

                <Button
                  type="primary"
                  onClick={() => void handleCreateVersion()}>
                  Add
                </Button>
              </Space>
            </Form>
          </Col>
        </Row>
      )}

      {session?.user?.role === 'ADMIN' && (
        <Row gutter={[16, 16]}>
          {/* Versions: */}
          <Col span={24}>
            <Typography.Title level={5}>Versions:</Typography.Title>
          </Col>

          {/* List of versions */}
          <>
            {componentVersionGetAll.data?.map((componentVersion) => (
              <Col span={8} key={componentVersion.id}>
                <Card
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
                        const handleSelect = async () => {
                          await componentVersionUpdateOne.mutateAsync({
                            id: componentVersion.id,
                            selected: e.target.checked,
                          })

                          // refetch components
                          await componentGetAll.refetch()
                        }
                        void handleSelect()
                      }}>
                      {componentVersion.selected ? '' : 'Select'}
                    </Checkbox>,
                    <EditOutlined
                      key="edit"
                      onClick={() => {
                        void router.push({
                          pathname: '/drawingtypes',
                          query: {
                            tab: '3',
                            edit: 'true',
                            componentVersionId: componentVersion.id,
                          },
                        })
                      }}
                    />,
                    <Dropdown
                      key={`${componentVersion.id}`}
                      menu={{ items }}
                      onOpenChange={(open) => {
                        if (!open) return

                        // set query delete=true and componentVersionId
                        void router.push(
                          {
                            pathname: '/drawingtypes',
                            query: {
                              ...router.query,
                              remove: 'true',
                              componentVersionId: componentVersion.id,
                            },
                          },
                          undefined,
                          { scroll: false },
                        )
                      }}
                      trigger={['click']}>
                      <Space>
                        <EllipsisOutlined />
                      </Space>
                    </Dropdown>,
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

                {/* Edit modal */}
                <Modal
                  title="Edit drawing type"
                  open={
                    edit === 'true' &&
                    componentVersionId === componentVersion.id
                  }
                  destroyOnClose
                  onCancel={() => {
                    void router.push({
                      pathname: '/drawingtypes',
                      query: {
                        ...router.query,
                        edit: undefined,
                        componentVersionId: undefined,
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
                          void componentVersionDeleteOne.mutate({
                            id: componentVersion.id,
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
                            ...router.query,
                            edit: undefined,
                            componentVersionId: undefined,
                          },
                        })
                      }}>
                      Cancel
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      onClick={() => {
                        void componentVersionUpdateOne.mutate({
                          id: componentVersion.id,
                          name: editNameRef.current?.input?.value,
                          emoji: editEmojiRef.current?.input?.value,
                          description: editDescriptionRef.current?.input?.value,
                        })

                        void router.push({
                          pathname: '/drawingtypes',
                          query: {
                            ...router.query,
                            edit: undefined,
                            componentVersionId: undefined,
                          },
                        })

                        // discard edit refs
                        if (editNameRef.current?.input)
                          editNameRef.current.input.value = ''
                        if (editEmojiRef.current?.input)
                          editEmojiRef.current.input.value = ''
                        if (editDescriptionRef.current?.input)
                          editDescriptionRef.current.input.value = ''
                      }}>
                      Update
                    </Button>,
                  ]}>
                  {/* Edit modal content */}
                  <Space direction="vertical">
                    <Input
                      placeholder="Main & Transfer"
                      addonBefore="Name"
                      defaultValue={componentVersion.name}
                      ref={editNameRef}
                    />
                    <Space.Compact
                      style={{
                        width: '100%',
                      }}>
                      <Input
                        placeholder="Some cool emojis for easy recognition"
                        addonBefore="Emoji"
                        defaultValue={componentVersion.emoji}
                        ref={editEmojiRef}
                      />
                      <Button
                        type="primary"
                        onClick={() => {
                          const emoji = someRandomEmoji().join('')
                          if (editEmojiRef.current?.input)
                            editEmojiRef.current.input.value = emoji
                        }}>
                        Generate
                      </Button>
                    </Space.Compact>
                    <Input
                      placeholder="The most popular drawing type map of electrical power substation"
                      addonBefore="Description"
                      defaultValue={componentVersion.description ?? ''}
                      ref={editDescriptionRef}
                    />
                  </Space>
                </Modal>
              </Col>
            ))}
          </>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        {/* Components: */}
        <Col span={session?.user?.role === 'ADMIN' ? 12 : 24}>
          <Typography.Title level={5}>Components:</Typography.Title>
        </Col>
        {session?.user?.role === 'ADMIN' && (
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
        )}

        {/* Table of components */}
        <Col span={12}>
          <Table
            sticky
            size="small"
            columns={columns}
            dataSource={components}
            pagination={{ pageSize: 20 }}
          />
        </Col>
      </Row>
    </>
  )
}
