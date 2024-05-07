import {
  FileSearchOutlined,
  LoadingOutlined,
  TableOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Container } from '@mui/material'
import {
  Card,
  Checkbox,
  Col,
  Row,
  Select,
  Skeleton,
  Space,
  Steps,
  Typography,
  theme,
} from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import PredictJPEG from '~/components/PredictJPEG'
import PredictionImage from '~/components/PredictionImage'
import PredictionTable from '~/components/PredictionTable'
import UploadPDF from '~/components/UploadPDF'
import type {
  BoundingBox,
  DrawingComponent,
  Hull,
  LineType,
  MissingComponent,
  RemainingComponent,
} from '~/models/drawings.model'
import { api } from '~/utils/api'

export default function Home() {
  // router
  const router = useRouter()
  const { drawingTypeId, preview } = router.query

  // hooks
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [lineTypes, setLineTypes] = useState<LineType[]>([])
  const [drawingComponents, setDrawingComponents] = useState<BoundingBox[]>([])
  const [foundComponents, setFoundComponents] = useState<BoundingBox[]>([])
  const [missingComponents, setMissingComponents] = useState<BoundingBox[]>([])
  const [remainingComponents, setRemainingComponents] = useState<BoundingBox[]>(
    [],
  )
  const { token } = theme.useToken()
  const [current, setCurrent] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [csvUrl, setCsvUrl] = useState('')
  const [jsonUrl, setJsonUrl] = useState('')
  const [predictedComponents, setPredictedComponents] = useState<BoundingBox[]>(
    [],
  )
  const [hulls, setHulls] = useState<Hull[]>([])
  const [clusteredFoundComponents, setClusteredFoundComponents] = useState<
    BoundingBox[]
  >([])
  // const predictedImageColRef = useRef<HTMLDivElement>(null)

  // handlers
  const next = useCallback(() => {
    setCurrent(current + 1)
  }, [current])
  // const prev = () => {
  //   setCurrent(current - 1)
  // }
  const handleChange = (value: string) => {
    // save drawingTypeId to localStorage
    localStorage.setItem('diagnose-drawingTypeId', value)

    void router.push(
      {
        pathname: router.pathname,
        query: {
          drawingTypeId: value,
        },
      },
      undefined,
      { scroll: false },
    )
  }
  const handleChangeStep = (current: number) => {
    setCurrent(current)
  }

  // trpc: getAllDrawings
  const getAllDrawings = api.drawingType.getAll.useQuery()

  // effect: setDefault drawingTypeId, if getAllDrawings.data is not empty
  useEffect(() => {
    if (getAllDrawings.data && !drawingTypeId) {
      const savedDrawingTypeId = localStorage.getItem('diagnose-drawingTypeId')
      const isSkipPreview = localStorage.getItem('diagnose-preview') === 'true'

      void router.push(
        {
          pathname: router.pathname,
          query: {
            drawingTypeId: getAllDrawings.data.some(
              (drawing) => drawing.id === savedDrawingTypeId,
            )
              ? savedDrawingTypeId
              : getAllDrawings.data?.[0]?.id,
            preview: isSkipPreview,
          },
        },
        undefined,
        { scroll: false },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllDrawings.data])

  const steps = useMemo(
    () => [
      {
        title: 'Upload Drawing',
        icon:
          current === 0 && isLoading ? <LoadingOutlined /> : <UploadOutlined />,
        content: (
          <>
            {/* Select the type of drawing */}
            <Col
              span={24}
              style={{
                textAlign: 'center',
              }}>
              <Typography.Title level={4}>
                Select the type of drawing
              </Typography.Title>

              {getAllDrawings.data ? (
                <Select
                  value={
                    (drawingTypeId as string) ?? getAllDrawings.data?.[0]?.id
                  }
                  onChange={handleChange}
                  options={
                    getAllDrawings.data?.map((drawing) => ({
                      label: drawing.name,
                      value: drawing.id,
                    })) ?? []
                  }
                />
              ) : (
                <Space>
                  <Skeleton
                    title={{
                      width: 200,
                    }}
                    paragraph={false}
                    active
                  />
                </Space>
              )}
            </Col>

            {/* Upload a PDF file*/}
            <Col
              span={24}
              style={{
                textAlign: 'center',
              }}>
              <UploadPDF
                imageFile={imageFile}
                setImageFile={setImageFile}
                next={next}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </Col>

            {/* Check box, if users want to see preview image */}
            <Col
              span={24}
              style={{
                textAlign: 'center',
              }}>
              <Checkbox
                checked={preview === 'true' ? true : false}
                onChange={(e) => {
                  const checked = e.target.checked
                  void router.push(
                    {
                      pathname: router.pathname,
                      query: {
                        drawingTypeId: drawingTypeId,
                        preview: checked,
                      },
                    },
                    undefined,
                    { scroll: false },
                  )

                  // save to localStorage
                  localStorage.setItem('diagnose-preview', String(checked))
                }}>
                Skip preview image
              </Checkbox>
            </Col>
          </>
        ),
      },
      {
        title: 'Predict & Diagnose',
        icon:
          current === 1 && isLoading ? (
            <LoadingOutlined />
          ) : (
            <FileSearchOutlined />
          ),
        content: (
          <>
            {/* Send to prediction */}
            <Col
              span={16}
              style={{
                textAlign: 'center',
              }}>
              <PredictJPEG
                imageFile={imageFile}
                setLineTypes={setLineTypes}
                setDrawingComponents={setDrawingComponents}
                setFoundComponents={setFoundComponents}
                setMissingComponents={setMissingComponents}
                setRemainingComponents={setRemainingComponents}
                setClusteredFoundComponents={setClusteredFoundComponents}
                setHulls={setHulls}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setCsvUrl={setCsvUrl}
                setJsonUrl={setJsonUrl}
                next={next}
                setPredictedComponents={setPredictedComponents}
                drawingTypeId={drawingTypeId as string}
              />
            </Col>
          </>
        ),
      },
      {
        title: 'Image Results',
        icon:
          current === 2 && isLoading ? <LoadingOutlined /> : <TableOutlined />,
        content: (
          <>
            {/* Display prediction with kanva*/}
            <Col
              span={24}
              style={{
                textAlign: 'center',
              }}>
              <PredictionImage
                imageFile={imageFile}
                predictedComponents={predictedComponents}
                foundComponents={foundComponents}
                remainingComponents={remainingComponents}
                hulls={hulls}
                clusteredFoundComponents={clusteredFoundComponents}
                predictionTable={
                  <PredictionTable
                    lineTypes={lineTypes}
                    drawingComponents={drawingComponents}
                    remainingComponents={remainingComponents}
                    missingComponents={missingComponents}
                    csvUrl={csvUrl}
                    jsonUrl={jsonUrl}
                  />
                }
                drawingComponents={drawingComponents}
                missingComponents={missingComponents}
              />
            </Col>
          </>
        ),
      },
    ],
    [
      current,
      isLoading,
      getAllDrawings.data,
      drawingTypeId,
      imageFile,
      preview,
      predictedComponents,
      foundComponents,
      remainingComponents,
      hulls,
      clusteredFoundComponents,
      lineTypes,
      drawingComponents,
      missingComponents,
      csvUrl,
      jsonUrl,
      router,
    ],
  )
  const items = steps.map((item) => ({ key: item.title, title: item.title }))

  return (
    <>
      <Head>
        <title>ASDR | Home</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="lg">
        <Card>
          <Row justify="center" align="middle" style={{ width: '100%' }}>
            {/* Steps */}
            <>
              <Steps
                current={current}
                items={items}
                onChange={handleChangeStep}
              />
              <Row
                justify="center"
                align="top"
                gutter={[16, 16]}
                style={{
                  // minHeight: 600,
                  marginTop: 16,
                  padding: 16,
                  width: '100%',
                  borderRadius: token.borderRadiusLG,
                  border: `1px dashed ${token.colorBorder}`,
                  alignContent: 'flex-start',
                }}>
                {steps[current]?.content}
              </Row>
            </>
          </Row>
        </Card>
      </Container>
    </>
  )
}
