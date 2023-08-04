
export interface LineType {
  name: string
  count: number
}

export interface DrawingComponent {
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

export interface BoundingBox{
    id: string
    xmin: number
    ymin: number
    xmax: number
    ymax: number
    confidence: number
    class: number
    name: string
    color: string
}