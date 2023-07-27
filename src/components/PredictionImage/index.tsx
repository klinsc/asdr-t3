import type Konva from 'konva'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Image as KonvaImage, Layer, Rect, Stage, Transformer } from 'react-konva'
import useImage from 'use-image'
import { type BoundingBox } from '~/models/drawings.model'

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
        onTransformEnd={(_e) => {
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

// const initialRectangles = [
//   {
//     x: 10,
//     y: 10,
//     width: 100,
//     height: 100,
//     // fill with red opacity .5
//     fill: 'rgba(255, 0, 0, 0.5)',
//     id: 'rect1',
//   },
//   {
//     x: 150,
//     y: 150,
//     width: 100,
//     height: 100,
//     fill: 'green',
//     id: 'rect2',
//   },
// ]

// the first very simple and recommended way:
const DrawingImage = ({ src }: { src: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const [image] = useImage(src) as [HTMLImageElement | undefined, 'loading' | 'loaded' | 'failed']
  return <>{image && <KonvaImage image={image} alt="" />}</>
}

const scaleBy = 1.01

function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

function getCenter(
  p1: {
    x: number
    y: number
  },
  p2: {
    x: number
    y: number
  },
) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  }
}

function touchEnabled() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.maxTouchPoints > 0
}

interface PredictionImageProps {
  imageFile: File | null
  jsonResult: BoundingBox[]
}

const PredictionImage = ({ imageFile, jsonResult }: PredictionImageProps) => {
  // hooks
  const [selectedId, selectShape] = useState<string | null>(null)

  // update rectangles when jsonResult changes
  const initialRectangles = useMemo(() => {
    return jsonResult.map((result, i) => {
      return {
        x: result.xmin,
        y: result.ymin,
        width: result.xmax - result.xmin,
        height: result.ymax - result.ymin,
        // fill with green opacity .3
        fill: 'rgba(0, 0, 255, 0.3)',
        id: i.toString(),
      }
    })
  }, [jsonResult])
  const [rectangles, setRectangles] = useState(initialRectangles)

  // get image size from imageFile
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    if (!imageFile) return
    const img = new Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
    }
    img.src = URL.createObjectURL(imageFile)
  }, [imageFile])

  // zooming & panning logics
  const stageRef = useRef<Konva.Stage>(null)
  let lastCenter: { x: number; y: number } | null = null
  let lastDist = 0
  function zoomStage(event: { evt: { preventDefault: () => void; deltaY: number } }) {
    event.evt.preventDefault()
    if (stageRef.current !== null) {
      const stage = stageRef.current
      const oldScale = stage.scaleX()
      const pointer2D = stage.getPointerPosition()
      if (!pointer2D) return

      const pointerX = pointer2D.x
      const pointerY = pointer2D.y

      const mousePointTo = {
        x: (pointerX - stage.x()) / oldScale,
        y: (pointerY - stage.y()) / oldScale,
      }
      const newScale = event.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy
      stage.scale({ x: newScale, y: newScale })
      const newPos = {
        x: pointerX - mousePointTo.x * newScale,
        y: pointerY - mousePointTo.y * newScale,
      }
      stage.position(newPos)
      stage.batchDraw()
    }
  }
  function handleTouch(e: Konva.KonvaEventObject<TouchEvent>) {
    e.evt.preventDefault()
    const touch1 = e.evt.touches[0]
    const touch2 = e.evt.touches[1]
    const stage = stageRef.current
    if (stage !== null) {
      if (touch1 && touch2) {
        if (stage.isDragging()) {
          stage.stopDrag()
        }

        const p1 = {
          x: touch1.clientX,
          y: touch1.clientY,
        }
        const p2 = {
          x: touch2.clientX,
          y: touch2.clientY,
        }

        if (!lastCenter) {
          lastCenter = getCenter(p1, p2)
          return
        }
        const newCenter = getCenter(p1, p2)

        const dist = getDistance(p1, p2)

        if (!lastDist) {
          lastDist = dist
        }

        // local coordinates of center point
        const pointTo = {
          x: (newCenter.x - stage.x()) / stage.scaleX(),
          y: (newCenter.y - stage.y()) / stage.scaleX(),
        }

        const scale = stage.scaleX() * (dist / lastDist)

        stage.scaleX(scale)
        stage.scaleY(scale)

        // calculate new position of the stage
        const dx = newCenter.x - lastCenter.x
        const dy = newCenter.y - lastCenter.y

        const newPos = {
          x: newCenter.x - pointTo.x * scale + dx,
          y: newCenter.y - pointTo.y * scale + dy,
        }

        stage.position(newPos)
        stage.batchDraw()

        lastDist = dist
        lastCenter = newCenter
      }
    }
  }
  function handleTouchEnd() {
    lastCenter = null
    lastDist = 0
  }

  // this is for moving the labels (future feature)
  // const checkDeselect = (e: { target: { getStage: () => unknown } }) => {
  //   // deselect when clicked on empty area
  //   const clickedOnEmpty = e.target === e.target.getStage()
  //   if (clickedOnEmpty) {
  //     selectShape(null)
  //   }
  // }

  return (
    <Stage
      width={imageSize.width || 600}
      height={imageSize.height || 600}
      draggable={!touchEnabled()}
      onWheel={zoomStage}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouchEnd}
      ref={stageRef}

      // this is for moving the labels (future feature)
      // onMouseDown={checkDeselect}
      // onTouchStart={checkDeselect}
    >
      <Layer>
        <DrawingImage
          src={
            imageFile
              ? URL.createObjectURL(imageFile)
              : 'data:image/png;base64,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'
          }
        />
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

export default PredictionImage

// https://github.com/konvajs/konva
// https://colinwren.medium.com/adding-zoom-and-panning-to-your-react-konva-stage-3e0a38c31d38
