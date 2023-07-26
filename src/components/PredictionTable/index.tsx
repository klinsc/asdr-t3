import { Button, Card, Checkbox, Col, Row, Space } from 'antd'
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
        <Checkbox onChange={() => handleCheckbox(0)} checked={hidden[0]}>
          Drawing Components
        </Checkbox>
        <Checkbox onChange={() => handleCheckbox(1)} checked={hidden[1]}>
          Line Types
        </Checkbox>
        <Checkbox onChange={() => handleCheckbox(2)} checked={hidden[2]}>
          Remaining Components
        </Checkbox>
        <Checkbox onChange={() => handleCheckbox(3)} checked={hidden[3]}>
          Missing Components
        </Checkbox>
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
      {/* <Space direction="vertical" size={16}>
        <Card title="Default size card" extra={<a href="#">More</a>} style={{ width: 300 }}>
          <DrawingComponentTable drawingComponents={drawingComponents} />
        </Card>
        <Card title="Default size card" extra={<a href="#">More</a>} style={{ width: 300 }}>
          <LineTypeTable lineTypes={lineTypes} />
        </Card>
        <Card title="Default size card" extra={<a href="#">More</a>} style={{ width: 300 }}>
          <RemainingComponentTable remainingComponents={remainingComponents} />
        </Card>
        <Card title="Default size card" extra={<a href="#">More</a>} style={{ width: 300 }}>
          <MissingComponentTable missingComponents={missingComponents} />
        </Card>
      </Space> */}
    </>
  )
}

export default PredictionTable
