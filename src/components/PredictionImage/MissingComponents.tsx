import { Collapse, Typography, theme, type CollapseProps } from 'antd'
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
      <>
        {groupedComponents.map((component) => (
          <Typography.Paragraph
            key={component.name}
            type="danger"
            style={{
              textAlign: 'left',
              marginBottom: 0,
            }}>
            {`${component.name} x${component.count}`}
          </Typography.Paragraph>
        ))}
      </>
    )
  }, [props.missingComponents])

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: (
        <Typography.Text
          type="danger"
          style={{
            fontWeight: 'bold',
          }}>{`${props.missingComponents.length} components are missing`}</Typography.Text>
      ),
      children: content,
    },
  ]

  return (
    <Collapse
      prefixCls="show-error"
      size="small"
      defaultActiveKey={['1']}
      items={items}
      style={{
        pointerEvents: 'auto',
        backgroundColor: token.colorErrorBg,
        borderColor: token.colorErrorBorder,
      }}
    />
  )
}
