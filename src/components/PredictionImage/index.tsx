import { BgColorsOutlined, FilterOutlined } from '@ant-design/icons'
import {
  Button,
  Checkbox,
  Col,
  Modal,
  Row,
  Segmented,
  Space,
  Tabs,
  Typography,
  message,
  type TabsProps,
} from 'antd'
import type Konva from 'konva'
import { useRouter } from 'next/router'
import {
  Fragment,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Image as KonvaImage,
  Label,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
} from 'react-konva'
import useImage from 'use-image'
import {
  type FoundComponentHull,
  type BoundingBox,
  type Hull,
} from '~/models/drawings.model'
import { api } from '~/utils/api'
import { evaluate_cmap } from '~/utils/js-colormaps'
import DrawingComponentTable from '../PredictionTable/DrawingComponentTable'
import MissingComponents from './MissingComponents'
import { useSession } from 'next-auth/react'

export interface RectangleProps {
  key: string
  x: number
  y: number
  width: number
  height: number
  // fill: string
  id: string
  name: string
  stroke: string
  strokeWidth: number
  visible: boolean
  clusterLineTypeId: string
  lineTypeName: string
}

const Rectangle = ({
  shapeProps,
}: // isSelected,
// onSelect,
// onChange,
{
  shapeProps: RectangleProps
  // isSelected: boolean
  // onSelect: () => void
  // onChange: (newAttrs: RectangleProps) => void
}) => {
  const shapeRef = useRef<Konva.Rect>(null)
  // const trRef = useRef<Konva.Transformer>(null)

  // line type id is any string before - in the clusterLineTypeId
  const lineTypeId = shapeProps.clusterLineTypeId?.split('-')?.[0] ?? ''

  // trpc: get line type by id
  const { data: lineType } = api.lineType.getOne.useQuery(
    { id: lineTypeId },
    {
      enabled: !!shapeProps.clusterLineTypeId,
    },
  )

  // useEffect(() => {
  //   if (isSelected) {
  //     if (!trRef?.current || !shapeRef?.current) return

  //     // we need to attach transformer manually
  //     trRef.current.nodes([shapeRef.current])
  //     trRef.current.getLayer()?.batchDraw()
  //   }
  // }, [isSelected])

  return (
    <Fragment>
      <Label
        x={shapeProps.x}
        y={shapeProps.y - 60}
        // opacity={isSelected ? 1 : 1}
        // draggable
        visible={shapeProps.visible}
        // onDragEnd={(e) => {
        //   onChange({
        //     ...shapeProps,
        //     x: e.target.x(),
        //     y: e.target.y(),
        //   })
        // }}
      >
        <Text
          text={lineType?.name ?? ''}
          fill={shapeProps.stroke}
          fontSize={26}
          stroke={shapeProps.stroke}
          strokeWidth={2}
          padding={10}
        />
      </Label>
      <Label
        x={shapeProps.x}
        y={shapeProps.y - 40}
        // opacity={isSelected ? 1 : 1}
        // draggable
        visible={shapeProps.visible}
        // onDragEnd={(e) => {
        //   onChange({
        //     ...shapeProps,
        //     x: e.target.x(),
        //     y: e.target.y(),
        //   })
        // }}
      >
        <Text
          text={shapeProps.name}
          fill={shapeProps.stroke}
          fontSize={26}
          stroke={shapeProps.stroke}
          strokeWidth={2}
          padding={10}
        />
      </Label>
      <Rect
        // onClick={onSelect}
        // onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        // draggable
        // onDragEnd={(e) => {
        //   onChange({
        //     ...shapeProps,
        //     x: e.target.x(),
        //     y: e.target.y(),
        //   })
        // }}
        // onTransformEnd={(_e) => {
        //   // transformer is changing scale of the node
        //   // and NOT its width or height
        //   // but in the store we have only width and height
        //   // to match the data better we will reset scale on transform end
        //   const node = shapeRef.current
        //   if (!node) return

        //   const scaleX = node.scaleX()
        //   const scaleY = node.scaleY()

        //   // we will reset it back
        //   node.scaleX(1)
        //   node.scaleY(1)
        //   onChange({
        //     ...shapeProps,
        //     x: node.x(),
        //     y: node.y(),
        //     // set minimal value
        //     width: Math.max(5, node.width() * scaleX),
        //     height: Math.max(node.height() * scaleY),
        //   })
        // }}
      />
      {/* {isSelected && (
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
      )} */}
    </Fragment>
  )
}

// hex to rgb
function hexToRgb(hex: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      `rgb(${parseInt(result[1] ?? '', 16)},${parseInt(
        result[2] ?? '',
        16,
      )},${parseInt(result[3] ?? '', 16)},1.0)`
    : null
}

// the first very simple and recommended way:
const DrawingImage = ({
  src,
  fitImage,
}: {
  src: string
  fitImage: () => void
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const [image, status] = useImage(src) as [
    HTMLImageElement | undefined,
    'loading' | 'loaded' | 'failed',
  ]

  useEffect(() => {
    if (status === 'loaded') fitImage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return <>{<KonvaImage image={image} alt="" />}</>
}

const scaleBy = 1.01

function getDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
) {
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
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.maxTouchPoints > 0
  )
}

function Hulls(props: { points: [] }) {
  // Convert points array to the format required by Konva Line component
  const flattenedPoints = props.points.flatMap((point) => [point[0], point[1]])

  return (
    <>
      {/* Use polygon instead */}
      <Line
        points={flattenedPoints}
        stroke="red"
        strokeWidth={100}
        fill="red"
        opacity={0.3}
        lineCap="round"
        lineJoin="round"
        closed
        tension={0.5} // Add tension to create smooth curves
      />
    </>
  )
}

interface PredictionImageProps {
  imageFile: File | null
  predictedComponents: BoundingBox[]
  remainingComponents: BoundingBox[]
  foundComponents: BoundingBox[]
  predictionTable: JSX.Element
  drawingComponents: BoundingBox[]
  missingComponents: BoundingBox[]
  hulls: Hull[]
  clusteredFoundComponents: BoundingBox[]
  foundComponentHulls: FoundComponentHull[]
}

export default function PredictionImage({
  imageFile,
  predictedComponents,
  remainingComponents,
  foundComponents,
  predictionTable,
  drawingComponents,
  missingComponents,
  hulls,
  clusteredFoundComponents,
  foundComponentHulls,
}: // predictedImageColRef
PredictionImageProps) {
  // router
  const router = useRouter()
  const { creating, display, colorby, showError } = router.query

  // session
  const { data: session } = useSession()

  const [messageAPI, contextHolder] = message.useMessage()

  // states
  // const [selectedId, selectShape] = useState<string | null>(null)

  // refs
  const predictedImageColRef = useRef<HTMLDivElement>(null)

  // trpc: create new drawing type
  const createDrawingTemplate = api.drawingType.createTemplate.useMutation({
    onSuccess: () => {
      void messageAPI.success('Create Drawing Type Success')
    },
    onError: (error) => {
      void messageAPI.error(error.message)
    },
  })

  // handler: handleModalOpen
  const handleModalOpen = useCallback(() => {
    void router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        creating: 'true',
      },
    })
  }, [router])

  // handler: handleModalCancle
  const handleModalCancle = () => {
    void router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        creating: undefined,
      },
    })
  }

  // handler: handleModalOk
  const handleModalOk = async () => {
    interface DrawingComponent {
      id: string
      name: string
      count: number
      clusterLineTypeId: string
    }

    const data = () => {
      const newData = clusteredFoundComponents.map((component) => {
        return {
          id: component.componentId,
          name: component.name,
          count: 1,
          clusterLineTypeId: component.clusterLineTypeId,
        }
      }) as DrawingComponent[]

      // count duplicate
      const result: DrawingComponent[] = []
      newData.forEach((item) => {
        const index = result.findIndex(
          (resultItem) =>
            resultItem.id === item.id &&
            resultItem.clusterLineTypeId === item.clusterLineTypeId,
        )
        if (index >= 0) {
          const thisItem = result[index]
          if (thisItem) thisItem.count += 1
        } else {
          result.push(item)
        }
      })

      return result
    }

    await createDrawingTemplate.mutateAsync(data())

    await router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        creating: undefined,
      },
    })
  }

  // update rectangles when jsonResult changes
  const rectangles: RectangleProps[] = useMemo(() => {
    // with opacity .5 in green == 80 code
    const foundColor = '#73d13d'
    // with opacity .5 in yellow
    const remainingColor = '#4096ff'

    const evaluateColors = clusteredFoundComponents.map((component) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const rgb = evaluate_cmap(component.cluster, 'viridis', false)
      return {
        cluster: component.cluster,
        fill: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1.0)`,
      }
    })

    // display drawing components
    if (display === 'all') {
      return predictedComponents.map((result, i) => {
        if (colorby === 'display') {
          const isFound = foundComponents.some(
            (component) => component.key === result.key,
          )
          const isRemaining = remainingComponents.some(
            (component) => component.key === result.key,
          )

          const fill = isFound
            ? foundColor
            : isRemaining
            ? remainingColor
            : 'rgba(0, 0, 0, 0.5)'

          return {
            key: i.toString(),
            x: result.xmin,
            y: result.ymin,
            width: result.xmax - result.xmin,
            height: result.ymax - result.ymin,
            // fill: fill,
            stroke: fill,
            strokeWidth: 5,
            id: result.key,
            name: result.name,
            visible: true,
            clusterLineTypeId: result.clusterLineTypeId,
            lineTypeName: '',
          }
        }

        const fill = hexToRgb(result.color) ?? 'rgba(0, 0, 0, 0.5)'

        return {
          key: i.toString(),
          x: result.xmin,
          y: result.ymin,
          width: result.xmax - result.xmin,
          height: result.ymax - result.ymin,
          // fill: fill,
          stroke: fill,
          strokeWidth: 5,
          id: result.key,
          name: result.name,
          visible: true,
          clusterLineTypeId: result.clusterLineTypeId,
          lineTypeName: '',
        }
      })
    }

    // display remaining components
    if (display === 'remaining') {
      return remainingComponents.map((result, i) => {
        const fill =
          colorby === 'display'
            ? remainingColor
            : hexToRgb(result.color) ?? 'rgba(0, 0, 0, 0.5)'
        return {
          key: i.toString(),
          x: result.xmin,
          y: result.ymin,
          width: result.xmax - result.xmin,
          height: result.ymax - result.ymin,
          // fill: fill,
          stroke: fill,
          strokeWidth: 5,
          id: result.key,
          name: result.name,
          visible: true,
          clusterLineTypeId: result.clusterLineTypeId,
          lineTypeName: '',
        }
      })
    }

    if (colorby === 'cluster') {
      return clusteredFoundComponents.map((result, i) => {
        const fill =
          evaluateColors.find((color) => color.cluster === result.cluster)
            ?.fill ?? 'rgba(0, 0, 0, 0.5)'
        return {
          key: i.toString(),
          x: result.xmin,
          y: result.ymin,
          width: result.xmax - result.xmin,
          height: result.ymax - result.ymin,
          // fill: fill,
          stroke: fill,
          strokeWidth: 5,
          id: result.key,
          name: result.name,
          visible: true,
          clusterLineTypeId: result.clusterLineTypeId,
          lineTypeName: '',
        }
      })
    }

    // display default list, found components
    return foundComponents.map((result, i) => {
      const fill =
        colorby === 'display'
          ? foundColor
          : hexToRgb(result.color) ?? 'rgba(0, 0, 0, 0.5)'
      return {
        key: i.toString(),
        x: result.xmin,
        y: result.ymin,
        width: result.xmax - result.xmin,
        height: result.ymax - result.ymin,
        // fill: fill,
        stroke: fill,
        strokeWidth: 5,
        id: result.key,
        name: result.name,
        visible: true,
        clusterLineTypeId: result.clusterLineTypeId,
        lineTypeName: result.lineTypeName,
      }
    })
  }, [
    clusteredFoundComponents,
    display,
    foundComponents,
    predictedComponents,
    colorby,
    remainingComponents,
  ])

  // get image size from imageFile
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    if (!imageFile) return
    const img = new Image()
    img.onload = () => {
      if (!predictedImageColRef) return

      // get width size of predictedImageColRef.current
      const width = predictedImageColRef.current?.offsetWidth ?? 0

      // scroll Y by 96, to get image to the center
      window.scrollTo(0, 96)

      // set stage size
      setStageSize({ width, height: (width * img.height) / img.width })
    }
    img.src = URL.createObjectURL(imageFile)
  }, [imageFile, predictedImageColRef])

  // zooming & panning logics
  const stageRef = useRef<Konva.Stage>(null)
  let lastCenter: { x: number; y: number } | null = null
  let lastDist = 0
  function zoomStage(event: {
    evt: { preventDefault: () => void; deltaY: number }
  }) {
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
      const newScale =
        event.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy
      stage.scale({ x: newScale, y: newScale })
      const newPos = {
        x: pointerX - mousePointTo.x * newScale,
        y: pointerY - mousePointTo.y * newScale,
      }
      stage.position(newPos)
      stage.batchDraw()
    }
  }
  // create a function like zoomState function that will fit the stage into the column width
  const fitImage = useCallback(() => {
    if (stageRef.current !== null) {
      const stage = stageRef.current
      if (!imageFile) return
      const image = stage.findOne('Image')
      if (!image) return
      const imageWidth = image.width() ?? 0
      const colWidth = predictedImageColRef.current?.offsetWidth ?? 0
      const newScale = colWidth / imageWidth

      stage.scale({ x: newScale, y: newScale })
      stage.position({ x: 0, y: 0 })
      stage.batchDraw()
    }
  }, [imageFile, predictedImageColRef])
  const handleTouch = useCallback((e: Konva.KonvaEventObject<TouchEvent>) => {
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

        // eslint-disable-next-line react-hooks/exhaustive-deps
        lastDist = dist
        // eslint-disable-next-line react-hooks/exhaustive-deps
        lastCenter = newCenter
      }
    }
  }, [])
  const handleTouchEnd = useCallback(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    lastCenter = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
    lastDist = 0
  }, [])

  // handlers: on tabs change
  const onTabsChange = (key: string) => {
    console.log(key)
  }

  // constL tabs items
  const tabsItems: TabsProps['items'] = useMemo(() => {
    return [
      {
        label: 'Image Result',
        key: '1',
        children: (
          <Row
            style={{
              pointerEvents: 'none',
            }}>
            {/* Wrapper for Konva stage */}
            <Col
              span={24}
              ref={predictedImageColRef}
              style={{
                pointerEvents: 'auto',
              }}>
              <Stage
                onLoaded={() => {
                  // fitImage()
                }}
                width={stageSize.width || 600}
                height={stageSize.height || 600}
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
                    fitImage={fitImage}
                  />
                  {rectangles.map((rect, i) => {
                    return (
                      <Rectangle
                        key={i}
                        shapeProps={rect}
                        // isSelected={rect.id === selectedId}
                        // onSelect={() => {
                        //   selectShape(rect.id)
                        // }}
                        // onChange={(newAttrs: RectangleProps) => {
                        //   const rects = rectangles.slice()
                        //   rects[i] = newAttrs
                        //   setRectangles(rects)
                        // }}
                      />
                    )
                  })}

                  {/* hulls */}
                  {/* {hulls.map((hull, i) => {
                    if (
                      missingComponents.find(
                        (component) =>
                          component.lineTypeName === hull.clusterLineTypeName,
                      ) &&
                      showError === 'true'
                    )
                      return <Hulls key={i} points={hull.points} />

                    return null
                  })} */}
                  {foundComponentHulls.map((hull, i) => {
                    if (
                      missingComponents.find(
                        (component) =>
                          component.lineTypeName.split('-')[0] ===
                          hull.foundLineTypeName.split('-')[0],
                      )
                    ) {
                      return <Hulls key={i} points={hull.points as []} />
                    }

                    return null
                  })}
                </Layer>
              </Stage>
            </Col>

            {/* Wrapper for absolute div */}
            <Col
              span={24}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}>
              {/* Start new row */}
              <Row
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '10px',
                }}>
                {/* leftTop as goal items */}
                <Col
                  span={12}
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                  }}>
                  <Space direction="vertical" size="small" align="start">
                    {/* Display missing components */}
                    <MissingComponents missingComponents={missingComponents} />
                  </Space>
                </Col>
                {/* rightTop as tools */}
                <Col
                  span={12}
                  style={{
                    textAlign: 'right',
                  }}>
                  <Row gutter={[0, 4]}>
                    <Col span={24}>
                      <Button
                        size="small"
                        onClick={fitImage}
                        style={{
                          pointerEvents: 'auto',
                        }}>
                        Fit to screen
                      </Button>
                    </Col>

                    {session && (
                      <Col span={24}>
                        <Segmented
                          style={{
                            pointerEvents: 'auto',
                          }}
                          size="small"
                          defaultValue="Found"
                          options={[
                            {
                              label: 'Found',
                              value: 'Found',
                              icon:
                                display === 'found' ? (
                                  <FilterOutlined />
                                ) : undefined,
                            },

                            {
                              value: 'Remaining',
                              label: 'Remaining',
                              icon:
                                display === 'remaining' ? (
                                  <FilterOutlined />
                                ) : undefined,
                            },
                            {
                              value: 'All',
                              label: 'All',
                              icon:
                                display === 'all' ? (
                                  <FilterOutlined />
                                ) : undefined,
                            },
                          ]}
                          onChange={(value) => {
                            const valueString = value
                              .toString()
                              .toLocaleLowerCase()
                            void router.push(
                              {
                                pathname: router.pathname,
                                query: {
                                  ...router.query,
                                  display: valueString,
                                },
                              },
                              undefined,
                              {
                                scroll: false,
                              },
                            )
                          }}
                        />
                      </Col>
                    )}
                    {/* Color by class or display*/}
                    {session && (
                      <Col span={24}>
                        <Segmented
                          style={{
                            pointerEvents: 'auto',
                          }}
                          size="small"
                          defaultValue="Class"
                          // options={['Class', 'Display']}
                          options={[
                            {
                              label: 'Class',
                              value: 'Class',
                              icon:
                                colorby === 'class' ? (
                                  <BgColorsOutlined />
                                ) : undefined,
                            },
                            {
                              value: 'Display',
                              label: 'Display',
                              icon:
                                colorby === 'display' ? (
                                  <BgColorsOutlined />
                                ) : undefined,
                            },
                            {
                              value: 'Cluster',
                              label: 'Cluster',
                              icon:
                                colorby === 'cluster' ? (
                                  <BgColorsOutlined />
                                ) : undefined,
                            },
                          ]}
                          onChange={(value) => {
                            const valueString = value
                              .toString()
                              .toLocaleLowerCase()
                            void router.push(
                              {
                                pathname: router.pathname,
                                query: {
                                  ...router.query,
                                  colorby: valueString,
                                },
                              },
                              undefined,
                              {
                                scroll: false,
                              },
                            )
                          }}
                        />
                      </Col>
                    )}

                    {/* Show possible missing areas */}
                    {/* <Col span={24}>
                      <Checkbox
                        prefixCls="show-error-checkbox"
                        style={{
                          pointerEvents: 'auto',
                          color:
                            showError === 'true' ? '#000000E0' : '#000000A6',
                          background: 'rgb(250, 250, 250,0.5)',
                          backdropFilter: 'blur(1px)',
                        }}
                        checked={showError === 'true'}
                        onChange={(e) => {
                          void router.push(
                            {
                              pathname: router.pathname,
                              query: {
                                ...router.query,
                                showError: e.target.checked.toString(),
                              },
                            },
                            undefined,
                            {
                              scroll: false,
                            },
                          )
                        }}>
                        Show possible missing areas
                      </Checkbox>
                    </Col> */}
                  </Row>
                </Col>

                {/* leftBottom as tools */}
                <Col
                  span={12}
                  style={{
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    alignItems: 'flex-start',
                  }}>
                  <Row gutter={[0, 4]}>
                    <Col span={24}>
                      <Button
                        size="small"
                        onClick={() => handleModalOpen()}
                        style={{
                          pointerEvents: 'auto',
                        }}>
                        Use as a new template
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        ),
      },
      {
        label: 'Table Result',
        key: '2',
        children: predictionTable,
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    colorby,
    display,
    fitImage,
    handleModalOpen,
    handleTouch,
    handleTouchEnd,
    hulls,
    imageFile,
    missingComponents,
    // predictionTable, // cause re-render when focus
    rectangles,
    router,
    showError,
    stageSize.height,
    stageSize.width,
  ])

  return (
    <>
      {contextHolder}

      <Row>
        <Col span={24}>
          <Tabs onChange={onTabsChange} type="card" items={tabsItems} />
        </Col>
      </Row>

      <Modal
        open={creating === 'true'}
        onCancel={() => handleModalCancle()}
        onOk={() => void handleModalOk()}
        confirmLoading={createDrawingTemplate.isLoading}
        title={
          <>
            <Typography.Title
              level={4}
              style={{
                margin: 0,
              }}>
              Use as a new drawing type
            </Typography.Title>
            <Typography.Text type="secondary">
              Create a new drawing type from these components
            </Typography.Text>
          </>
        }
        centered>
        <DrawingComponentTable
          drawingComponents={drawingComponents}
          bordered={false}
          size="small"
          pageSize={20}
        />
      </Modal>
    </>
  )
}

// https://github.com/konvajs/konva
// https://colinwren.medium.com/adding-zoom-and-panning-to-your-react-konva-stage-3e0a38c31d38
