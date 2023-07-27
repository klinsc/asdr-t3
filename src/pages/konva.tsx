import Konva from 'konva'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Image, Layer, Rect, Stage, Transformer } from 'react-konva'
import useImage from 'use-image'

const Rectangle = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}: {
  shapeProps: {
    x: number
    y: number
    width: number
    height: number
    fill: string
    id: string
  }
  isSelected: boolean
  onSelect: () => void
  onChange: (newAttrs: {
    x: number
    y: number
    width: number
    height: number
    fill: string
    id: string
  }) => void
}) => {
  const shapeRef = useRef<Konva.Rect>(null)
  const trRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (isSelected) {
      if (!trRef?.current || !shapeRef?.current) return

      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  return (
    <Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          })
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current
          if (!node) return

          const scaleX = node.scaleX()
          const scaleY = node.scaleY()

          // we will reset it back
          node.scaleX(1)
          node.scaleY(1)
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          })
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </Fragment>
  )
}

const initialRectangles = [
  {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    // fill with red opacity .5
    fill: 'rgba(255, 0, 0, 0.5)',
    id: 'rect1',
  },
  {
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    fill: 'green',
    id: 'rect2',
  },
]

// the first very simple and recommended way:
const LionImage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const [image] = useImage('https://konvajs.org/assets/lion.png') as [
    HTMLImageElement | undefined,
    'loading' | 'loaded' | 'failed',
  ]
  return <>{image && <Image image={image} alt="" />}</>
}

const App = () => {
  const [rectangles, setRectangles] = useState(initialRectangles)
  const [selectedId, selectShape] = useState<string | null>(null)

  const checkDeselect = (e: { target: { getStage: () => unknown } }) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      selectShape(null)
    }
  }

  return (
    <Stage width={1000} height={1000} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
      <Layer>
        <LionImage />
        {rectangles.map((rect, i) => {
          return (
            <Rectangle
              key={i}
              shapeProps={rect}
              isSelected={rect.id === selectedId}
              onSelect={() => {
                selectShape(rect.id)
              }}
              onChange={(newAttrs: {
                x: number
                y: number
                width: number
                height: number
                fill: string
                id: string
              }) => {
                const rects = rectangles.slice()
                rects[i] = newAttrs
                setRectangles(rects)
              }}
            />
          )
        })}
      </Layer>
    </Stage>
  )
}

export default App
