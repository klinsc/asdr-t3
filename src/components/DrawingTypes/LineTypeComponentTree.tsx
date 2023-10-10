import { Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { useMemo } from 'react'
import { api } from '~/utils/api'

enum ComponentType {
  MANDATORY = 'mandatory',
  OPTIONAL = 'optional',
}

interface LineTypeTreeProps {
  lineTypeId: string
}

const LineTypeTree = ({ lineTypeId }: LineTypeTreeProps) => {
  // trpcs: getLineTypeComponents
  const getLineTypeComponents = api.lineTypeComponent.getAll.useQuery({
    lineTypeId,
  })

  // consts: treeData
  const treeData = useMemo(() => {
    const mandatoryComponents = getLineTypeComponents.data?.filter(
      (component) => component.componentType === ComponentType.MANDATORY,
    )
    const optionalComponents = getLineTypeComponents.data?.filter(
      (component) => component.componentType === ComponentType.OPTIONAL,
    )

    const mandatoryComponentsTreeData = mandatoryComponents?.map(
      (component) => ({
        title: component.Component.name,
        key: component.id,
      }),
    )
    const optionalComponentsTreeData = optionalComponents?.map((component) => ({
      title: component.Component.name,
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
  }, [getLineTypeComponents.data])

  return (
    <>
      {/* Tree */}
      <Tree selectable={false} showLine defaultExpandAll treeData={treeData} />
    </>
  )
}

export default LineTypeTree
