import { Button, Checkbox, Col, Row, Space } from 'antd'
import { useState } from 'react'
import type {
  DrawingComponent,
  LineType,
  MissingComponent,
  RemainingComponent,
} from '~/models/drawings.model'
import DrawingComponentTable from './DrawingComponentTable'
import LineTypeTable from './LineTypeTable'
import MissingComponentTable from './MissingComponentTable'
import RemainingComponentTable from './RemainingComponentTable'

interface PredictionTableProps {
  lineTypes: LineType[]
  drawingComponents: DrawingComponent[]
  missingComponents: MissingComponent[]
  remainingComponents: RemainingComponent[]
  csvUrl: string
  jsonUrl: string
}

const checkBoxes = [
  {
    name: 'Drawing Components',
    index: 0,
  },
  {
    name: 'Line Types',
    index: 1,
  },
  {
    name: 'Remaining Components',
    index: 2,
  },
  {
    name: 'Missing Components',
    index: 3,
  },
]

const PredictionTable = ({
  lineTypes,
  drawingComponents,
  missingComponents,
  remainingComponents,
  csvUrl,
  jsonUrl,
}: PredictionTableProps) => {
  const [hidden, setHidden] = useState([true, true, true, true])

  // handlers
  const handleCheckbox = (index: number) => {
    const newHidden = [...hidden]
    newHidden[index] = !newHidden[index]
    setHidden(newHidden)
  }

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'center' }}>
        {csvUrl && (
          <Button type="link" href={csvUrl} target="_blank" rel="noopener noreferrer">
            Download CSV
          </Button>
        )}
        {jsonUrl && (
          <Button type="link" href={jsonUrl} target="_blank" rel="noopener noreferrer">
            Download JSON
          </Button>
        )}
      </Space>

      <Space style={{ width: '100%', justifyContent: 'center' }}>
        {checkBoxes.map(({ name, index }) => (
          <Checkbox key={index} onChange={() => handleCheckbox(index)} checked={hidden[index]}>
            {name}
          </Checkbox>
        ))}
      </Space>

      <Space style={{ width: '100%', justifyContent: 'center' }}>
        <Row justify="center" align="top" gutter={[16, 16]}>
          <Col
            style={{
              display: hidden[0] ? 'block' : 'none',
            }}>
            <DrawingComponentTable drawingComponents={drawingComponents} />
          </Col>
          <Col
            style={{
              display: hidden[1] ? 'block' : 'none',
            }}>
            <LineTypeTable lineTypes={lineTypes} />
          </Col>
          <Col
            style={{
              display: hidden[2] ? 'block' : 'none',
            }}>
            <RemainingComponentTable remainingComponents={remainingComponents} />
          </Col>
          <Col
            style={{
              display: hidden[3] ? 'block' : 'none',
            }}>
            <MissingComponentTable missingComponents={missingComponents} />
          </Col>
        </Row>
      </Space>
    </>
  )
}

export default PredictionTable
