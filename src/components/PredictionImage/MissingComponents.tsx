import { Button, Popover, Typography, theme } from 'antd'
import { useMemo } from 'react'
import { type BoundingBox } from '~/models/drawings.model'

interface MissingComponentsProps {
  missingComponents: BoundingBox[]
}

export default function MissingComponents(props: MissingComponentsProps) {
  const { token } = theme.useToken()

  const content = useMemo(() => {
    // group by component name
    const groupedComponents = [] as {
      name: string
      count: number
    }[]
    // debugger
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
          <Typography.Paragraph
            key={component.name}
            type="danger"
            style={{
              marginBottom: 0,
            }}>
            {`${component.name} x${component.count}`}
          </Typography.Paragraph>
        ))}
      </div>
    )
  }, [props.missingComponents])

  return (
    <Popover
      placement="bottomLeft"
      content={content}
      trigger="click"
      color={token.colorErrorBg}>
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
