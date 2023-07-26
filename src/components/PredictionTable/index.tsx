import { Button, Col, Row, Space } from 'antd'
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
  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-end' }}>
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

      <Row justify="center" align="top" gutter={[16, 16]}>
        <Col>
          <DrawingComponentTable drawingComponents={drawingComponents} />
        </Col>
        <Col>
          <LineTypeTable lineTypes={lineTypes} />
        </Col>
        <Col>
          <RemainingComponentTable remainingComponents={remainingComponents} />
        </Col>
        <Col>
          <MissingComponentTable missingComponents={missingComponents} />
        </Col>
      </Row>
    </>
  )
}

export default PredictionTable
