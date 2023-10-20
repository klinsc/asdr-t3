import { Button, Popover, theme } from 'antd'
import type { LineType } from '@prisma/client'
import { useMemo } from 'react'
import { type BoundingBox } from '~/models/drawings.model'

interface MissingComponentsProps {
  missingComponents: BoundingBox & LineType[]
}

export default function MissingComponents(props: MissingComponentsProps) {
  const { token } = theme.useToken()

  // trpc: getLineTypes
  // const getLineTypes =

  const content = useMemo(() => {
    // group by component name
    const groupedComponents = [] as {
      name: string
      count: number
    }[]
    debugger
    for (const component of props.missingComponents) {
      const index = groupedComponents.findIndex(
        (c) => c.name === component.name,
      )
      if (index === -1) {
        groupedComponents.push({
          name: component.name,
          count: 1,
        })
      } else {
        const component = groupedComponents[index]
        if (component) {
          component.count += 1
        }
      }
    }
    return (
      <div>
        {groupedComponents.map((component) => (
          <div
            key={component.name}
            style={{
              color: 'red',
              fontWeight: 'bold',
              fontSize: '16px',
            }}>{`${component.name} x${component.count}`}</div>
        ))}
      </div>
    )
  }, [props.missingComponents])

  return (
    <Popover placement="bottomLeft" content={content} trigger="click">
      <Button
        type="primary"
        danger
        style={{
          pointerEvents: 'auto',
        }}>
        {`${props.missingComponents.length} components are missing`}
      </Button>
    </Popover>
  )
}
