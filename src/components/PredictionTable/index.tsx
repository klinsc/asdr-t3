import { Button, Checkbox, Col, Row, Space } from 'antd'
import { useEffect, useState } from 'react'
import type {
  BoundingBox,
  DrawingComponent,
  LineType,
  RemainingComponent,
} from '~/models/drawings.model'
import DrawingComponentTable from './DrawingComponentTable'
import MissingComponentTable from './MissingComponentTable'
import RemainingComponentTable from './RemainingComponentTable'

interface PredictionTableProps {
  lineTypes: LineType[]
  drawingComponents: BoundingBox[]
  foundComponents: BoundingBox[]
  missingComponents: BoundingBox[]
  remainingComponents: BoundingBox[]
  csvUrl: string
  jsonUrl: string
}

const checkBoxes = [
  {
    name: 'Drawing Components',
    index: 0,
  },
  // {
  //   name: 'Line Types',
  //   index: 1,
  // },
  // {
  //   name: 'Remaining Components',
  //   index: 2,
  // },
  {
    name: 'Missing Components',
    index: 3,
  },
]

type Hiddens = [boolean, boolean, boolean, boolean]

const PredictionTable = ({
  lineTypes,
  drawingComponents,
  foundComponents,
  missingComponents,
  remainingComponents,
  csvUrl,
  jsonUrl,
}: PredictionTableProps) => {
  const [hidden, setHidden] = useState<Hiddens>([false, false, false, false])

  // handlers
  const handleCheckbox = (index: number) => {
    const newHidden = [...hidden] as Hiddens
    newHidden[index] = !newHidden[index]
    setHidden(newHidden)
  }

  // effects: get store states from local storage
  useEffect(() => {
    const hiddenString = localStorage.getItem('hidden')
    if (!hiddenString) return

    const newHidden = JSON.parse(hiddenString) as Hiddens
    setHidden(newHidden)
  }, [])

  // effects: set store states to local storage
  useEffect(() => {
    localStorage.setItem('hidden', JSON.stringify(hidden))
  }, [hidden])

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'center' }}>
        {foundComponents && foundComponents?.length > 0 && (
          <Button
            type="link"
            // href={csvUrl}
            // target="_blank"
            // rel="noopener noreferrer"
            onClick={() => {
              const link = document.createElement('a')
              link.href = csvUrl

              // create a csv of the found components
              // const csv = foundComponents
              //   .map((component) => {
              //     return `${component.name},${component.xmin},${component.ymin},${component.xmax},${component.ymax},${component.confidence}`
              //   })
              //   .join('\n')

              // create a csv of the found components with headers name, xmin, ymin, xmax, ymax, confidence
              const csv = [
                ['name', 'xmin', 'ymin', 'xmax', 'ymax', 'confidence'],
                ...foundComponents.map((component) => [
                  component.name,
                  component.xmin,
                  component.ymin,
                  component.xmax,
                  component.ymax,
                  component.confidence,
                ]),
              ]
                .map((row) => row.join(','))
                .join('\n')

              const blob = new Blob([csv], { type: 'text/csv' })
              link.href = URL.createObjectURL(blob)
              link.download = 'found_components.csv'
              link.click()
            }}>
            Download CSV
          </Button>
        )}
        {/* {jsonUrl && (
          <Button
            type="link"
            href={jsonUrl}
            target="_blank"
            rel="noopener noreferrer">
            Download JSON
          </Button>
        )} */}
      </Space>

      <Row justify="center" align="top" gutter={[16, 16]}>
        <Col span={24}>
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            {checkBoxes.map(({ name, index }) => (
              <Checkbox
                key={index}
                onChange={() => handleCheckbox(index)}
                checked={hidden[index]}>
                {name}
              </Checkbox>
            ))}
          </Space>
        </Col>

        <Col
          span={8}
          style={{
            display: hidden[0] ? 'block' : 'none',
          }}>
          <DrawingComponentTable drawingComponents={drawingComponents} />
        </Col>
        {/* <Col
          span={8}
          style={{
            display: hidden[1] ? 'block' : 'none',
          }}>
          <LineTypeTable lineTypes={lineTypes} />
        </Col> */}
        {/* <Col
          span={8}
          style={{
            display: hidden[2] ? 'block' : 'none',
          }}>
          <RemainingComponentTable remainingComponents={remainingComponents} />
        </Col> */}
        <Col
          style={{
            display: hidden[3] ? 'block' : 'none',
          }}>
          <MissingComponentTable missingComponents={missingComponents} />
        </Col>
      </Row>
    </>
  )
}

export default PredictionTable
