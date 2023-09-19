import { CloseOutlined } from '@ant-design/icons'
import { Button, InputNumber, Select, Space, Tree, message } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { api } from '~/utils/api'

const onSearch = (value: string) => {
  console.log('search:', value)
}

enum ComponentType {
  MANDATORY = 'mandatory',
  OPTIONAL = 'optional',
}

// Filter `option.label` match the user type `input`
const filterOption = (
  input: string,
  option: { label: string; value: string } | undefined,
) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

const LineTypeTree = () => {
  // routers
  const router = useRouter()
  const { tab, edit, id, drawingTypeId, componentType, componentId } =
    router.query

  // messages
  const [messageApi, contextHolder] = message.useMessage()

  // hooks
  const editCountRef = React.useRef<HTMLInputElement>(null)

  // trpcs: getAllComponents
  const getAllComponents = api.component.getAll.useQuery()
  // trpcs: getLineTypeComponents
  const getLineTypeComponents = api.lineTypeComponent.getAll.useQuery({
    lineTypeId: id as string,
  })
  // trpcs: createLineTypeComponent
  const createLineTypeComponent = api.lineTypeComponent.create.useMutation({
    onSuccess: () => {
      void messageApi.success('Create line type component successfully')
      // void getAllComponents.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })
  // trpcs: deleteLineTypeComponent
  const deleteLineTypeComponent = api.lineTypeComponent.delete.useMutation({
    onSuccess: () => {
      void messageApi.success('Delete line type component successfully')
      void getAllComponents.refetch()
      void getLineTypeComponents.refetch()
    },
    onError: (error) => {
      void messageApi.error(error.message)
    },
  })

  // handlers: handleAdd
  const handleAdd = async () => {
    const count = editCountRef.current?.value
    await createLineTypeComponent.mutateAsync({
      lineTypeId: id as string,
      componentId: componentId as string,
      componentType: componentType as ComponentType,
      count: count ? parseInt(count) : 1,
    })

    void router.push({
      pathname: '/map',
      query: {
        tab,
        id,
        edit,
        drawingTypeId,
        componentType,
        componentId,
      },
    })

    void getLineTypeComponents.refetch()
  }

  // consts: options
  const options = useMemo(() => {
    // create a group of components by part
    const componentsByPart = getAllComponents.data?.reduce<
      Record<string, typeof getAllComponents.data>
    >((acc, component) => {
      const part = component.partId
      if (!acc[part]) {
        acc[part] = []
      }
      acc?.[part]?.push(component)
      return acc
    }, {})

    // create options
    const options = Object.entries(componentsByPart ?? {}).map(
      ([part, components]) => ({
        label: part,
        value: part,
        options: components.map((component) => ({
          value: component.id,
          label: component.name,
        })),
      }),
    )

    return options
  }, [getAllComponents])

  // consts: treeData
  const treeData = useMemo(() => {
    const mandatoryComponents = getLineTypeComponents.data?.filter(
      (component) => component.componentType === ComponentType.MANDATORY,
    )
    const optionalComponents = getLineTypeComponents.data?.filter(
      (component) => component.componentType === ComponentType.OPTIONAL,
    )

    // const mandatoryComponentIds = mandatoryComponents?.map(
    //   (component) => component.componentId,
    // )
    // const optionalComponentIds = optionalComponents?.map(
    //   (component) => component.componentId,
    // )

    const mandatoryComponentsTreeData = mandatoryComponents?.map(
      (component) => ({
        title: (
          <Space>
            {component.Component.name}
            <Button
              type="text"
              shape="circle"
              icon={
                <CloseOutlined
                  style={{
                    color: 'red',
                  }}
                />
              }
              onClick={() => {
                window.confirm(
                  'Are you sure you want to delete this line type component?',
                ) &&
                  void deleteLineTypeComponent.mutate({
                    lineTypeComponentId: component.id,
                  })
              }}></Button>
          </Space>
        ),
        key: component.id,
      }),
    )
    const optionalComponentsTreeData = optionalComponents?.map((component) => ({
      title: (
        <Space>
          {component.Component.name}
          <Button
            type="text"
            shape="circle"
            icon={
              <CloseOutlined
                style={{
                  color: 'red',
                }}
              />
            }
            onClick={() => {
              window.confirm(
                'Are you sure you want to delete this line type component?',
              ) &&
                void deleteLineTypeComponent.mutate({
                  lineTypeComponentId: component.id,
                })
            }}></Button>
        </Space>
      ),

      key: component.id,
    }))
    const treeData: DataNode[] = [
      {
        title: 'Mandatory',
        key: '0',
        children: mandatoryComponentsTreeData,
      },
      {
        title: 'Optional',
        key: '1',
        children: optionalComponentsTreeData,
      },
    ]

    return treeData
  }, [deleteLineTypeComponent, getLineTypeComponents.data])

  // effects: default query
  React.useEffect(() => {
    void router.push({
      pathname: '/map',
      query: {
        tab,
        edit,
        id,
        drawingTypeId: drawingTypeId as string,
        componentType: ComponentType.MANDATORY,
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {contextHolder}
      <Space direction="vertical">
        <Space>
          {/* Select a component */}
          <Select
            showSearch
            placeholder="Select a component"
            optionFilterProp="children"
            onSearch={onSearch}
            filterOption={filterOption}
            options={options}
            value={componentId as string}
            onChange={(value) => {
              void router.push({
                pathname: '/map',
                query: {
                  tab,
                  edit,
                  id,
                  drawingTypeId,
                  componentType,
                  componentId: value,
                },
              })
            }}
          />

          {/* Select a component type */}
          <Select
            defaultValue="mandatory"
            options={[
              { value: 'mandatory', label: 'Mandatory' },
              { value: 'optional', label: 'Optional' },
            ]}
            value={componentType as string}
            onChange={(value) => {
              void router.push({
                pathname: '/map',
                query: {
                  tab,
                  edit,
                  id,
                  drawingTypeId,
                  componentType: value,
                  componentId,
                },
              })
            }}
          />

          {/* Input for count */}
          <InputNumber
            min={1}
            max={10}
            defaultValue={1}
            style={{
              width: '8ch',
            }}
            ref={editCountRef}
          />

          {/* Add button */}
          <Button type="primary" onClick={() => void handleAdd()}>
            Add
          </Button>
        </Space>

        {/* Tree */}
        <Tree
          selectable={false}
          showLine
          defaultExpandAll
          treeData={treeData}
        />
      </Space>
    </>
  )
}

export default LineTypeTree
