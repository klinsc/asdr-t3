import { Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { useMemo } from 'react'
import { api } from '~/utils/api'

// enum ComponentType {
//   MANDATORY = 'mandatory',
//   OPTIONAL = 'optional',
// }

interface DrawingLineTypeTreeProps {
  drawingTypeId: string
}

const DrawingLineTypeTree = ({ drawingTypeId }: DrawingLineTypeTreeProps) => {
  // trpcs: getLineTypeComponents
  const getAllLineTypes = api.lineType.getAll.useQuery({
    drawingTypeId,
  })

  // // consts: treeData
  // const treeData = useMemo(() => {
  //   const mandatoryComponents = getLineTypeComponents.data?.filter(
  //     (component) => component.componentType === ComponentType.MANDATORY,
  //   )
  //   const optionalComponents = getLineTypeComponents.data?.filter(
  //     (component) => component.componentType === ComponentType.OPTIONAL,
  //   )

  //   const mandatoryComponentsTreeData = mandatoryComponents?.map(
  //     (component) => ({
  //       title: component.Component.name,
  //       key: component.id,
  //     }),
  //   )
  //   const optionalComponentsTreeData = optionalComponents?.map((component) => ({
  //     title: component.Component.name,
  //     key: component.id,
  //   }))
  //   const treeData: DataNode[] = [
  //     {
  //       title: 'Mandatory',
  //       key: '0',
  //       children: mandatoryComponentsTreeData,
  //     },
  //     {
  //       title: 'Optional',
  //       key: '1',
  //       children: optionalComponentsTreeData,
  //     },
  //   ]

  //   return treeData
  // }, [getLineTypeComponents.data])

  const treeData = useMemo(() => {
    const lineTypes = getAllLineTypes.data?.map((lineType) => ({
      title: lineType.name,
      key: lineType.id,
    }))
    const treeData: DataNode[] = [
      {
        title: 'Line Types',
        key: '0',
        children: lineTypes,
      },
    ]

    return treeData
  }, [getAllLineTypes.data])

  return (
    <>
      {/* Tree */}
      <Tree selectable={false} showLine defaultExpandAll treeData={treeData} />
    </>
  )
}

export default DrawingLineTypeTree
