export interface LineType {
  name: string
  count: number
}

export interface DrawingComponent {
  id: string
  name: string
  count: number
}

export interface MissingComponent {
  name: string
  line_type: string
  count: number
}

export interface RemainingComponent {
  name: string
  count: number
}

export interface BoundingBox {
  key: string
  xmin: number
  ymin: number
  xmax: number
  ymax: number
  confidence: number
  class: number
  name: string
  color: string
  lineTypeId: string
  cluster: number
  clusterLineTypeId: string
  lineTypeIdNumber: string
  lineTypeName: string
  componentId: string
}

export interface Point {
  x: number
  y: number
}

export interface Hull {
  key: string
  clusterLineTypeId: string
  points: Point[]
  clusterLineTypeName: string
}

export interface FoundComponentHull {
  key: string
  foundLineTypeId: string
  points: Point[]
  foundLineTypeName: string
}
