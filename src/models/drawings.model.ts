
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