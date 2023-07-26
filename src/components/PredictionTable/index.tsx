import { Col, Row } from 'antd'
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

const PredictionTable = ({
  lineTypes,
  setLineTypes,
  drawingComponents,
  setDrawingComponents,
  missingComponents,
  setMissingComponents,
  remainingComponents,
  setRemainingComponents,
}: {
  lineTypes: LineType[]
  setLineTypes: (lineTypes: LineType[]) => void
  drawingComponents: DrawingComponent[]
  setDrawingComponents: (drawingComponents: DrawingComponent[]) => void
  missingComponents: MissingComponent[]
  setMissingComponents: (missingComponents: MissingComponent[]) => void
  remainingComponents: RemainingComponent[]
  setRemainingComponents: (remainingComponents: RemainingComponent[]) => void
}) => {
  return (
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
      {/* <Col span={5}>
        <ExampleTable />
      </Col> */}
    </Row>
  )
}

export default PredictionTable
