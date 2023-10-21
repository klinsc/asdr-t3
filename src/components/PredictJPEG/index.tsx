import { SearchOutlined } from '@ant-design/icons'
import { Button, Image, Space, Typography, message } from 'antd'
import type { RcFile } from 'antd/es/upload'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import type {
  BoundingBox,
  DrawingComponent,
  Hull,
  LineType,
} from '~/models/drawings.model'
import { api } from '~/utils/api'

interface PredictJPEGProps {
  imageFile: File | null
  setLineTypes: (lineTypes: LineType[]) => void
  setDrawingComponents: (drawingComponents: DrawingComponent[]) => void
  setFoundComponents: (foundComponents: BoundingBox[]) => void
  setMissingComponents: (missingComponents: BoundingBox[]) => void
  setRemainingComponents: (remainingComponents: BoundingBox[]) => void
  setClusteredFoundComponents: (clusteredFoundComponents: BoundingBox[]) => void
  setHulls: (hulls: Hull[]) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  setCsvUrl: (csvUrl: string) => void
  setJsonUrl: (jsonUrl: string) => void
  next: () => void
  setPredictedComponents: (jsonResult: BoundingBox[]) => void
  drawingTypeId: string
}

export default function PredictJPEG({
  imageFile,
  // setLineTypes,
  setDrawingComponents,
  setFoundComponents,
  setMissingComponents,
  setRemainingComponents,
  setHulls,
  setClusteredFoundComponents,
  isLoading,
  setIsLoading,
  // setCsvUrl,
  // setJsonUrl,
  next,
  setPredictedComponents,
  drawingTypeId,
}: PredictJPEGProps) {
  // router
  const router = useRouter()
  const { preview } = router.query

  // messageAPI
  const [messageAPI, contextHolder] = message.useMessage()

  // trpcs
  const serverGetSelected = api.mlServer.getSelected.useQuery()

  // // handlers
  // const handleCheckbox = () => {
  //   setCheckbox(!checkbox)
  // }

  const handlePredict = async () => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('files[]', imageFile as RcFile)
      // You can use any AJAX library you like
      const response = await fetch(
        `${serverGetSelected?.data?.url}predict?drawingTypeId=${drawingTypeId}`,
        {
          method: 'POST',
          headers: {
            enctype: 'multipart/form-data',
            responseType: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: formData,
        },
      )
      // debugger
      const json = (await response.json()) as {
        line_types: string
        predicted_components: string
        missing_components: string
        remaining_components: string
        json_result: string
        found_components: string
        hulls: string
        clustered_found_components: string
      }
      if (response.status !== 200) throw new Error('Prediction failed!')
      debugger
      // parse json
      // const lineTypes = JSON.parse(json.line_types) as LineType[]
      const predicted_components = JSON.parse(
        json.predicted_components,
      ) as DrawingComponent[]
      const missing_components = JSON.parse(
        json.missing_components,
      ) as BoundingBox[]
      const remainingComponents = JSON.parse(
        json.remaining_components,
      ) as BoundingBox[]
      const predictedComponents = JSON.parse(
        json.predicted_components,
      ) as BoundingBox[]
      const foundComponents = JSON.parse(json.found_components) as BoundingBox[]
      const hulls = JSON.parse(json.hulls) as Hull[]
      const clusteredFoundComponents = JSON.parse(
        json.clustered_found_components,
      ) as BoundingBox[]

      console.log('predicted_components')
      console.table(predicted_components)

      console.log('found_components')
      console.table(foundComponents)

      console.log('remainingComponents')
      console.table(remainingComponents)

      console.log('missing_components')
      console.table(missing_components)

      console.log('hulls')
      console.table(hulls)

      console.log('clustered_found_components')
      console.table(clusteredFoundComponents)

      debugger
      // setLineTypes(lineTypes)
      setDrawingComponents(predicted_components)
      setFoundComponents(foundComponents)
      setMissingComponents(missing_components)
      setRemainingComponents(remainingComponents)
      setPredictedComponents(predictedComponents)
      setHulls(hulls)
      setClusteredFoundComponents(clusteredFoundComponents)

      // temporary: disabled csv and json

      // // CSV file
      // const csvResponse = await fetch(
      //   `${serverGetSelected?.data?.url}predict?type=csv`,
      //   {
      //     method: 'POST',
      //     headers: {
      //       enctype: 'multipart/form-data',
      //       responseType: 'text/csv',
      //     },
      //     body: formData,
      //   },
      // )
      // if (csvResponse.status !== 200) throw new Error('Prediction failed!')
      // const csvBlob = await csvResponse.blob()
      // const csvUrl = URL.createObjectURL(csvBlob)
      // setCsvUrl(csvUrl)

      // // JSON file
      // const jsonResponse = await fetch(
      //   `${serverGetSelected?.data?.url}predict?type=json`,
      //   {
      //     method: 'POST',
      //     headers: {
      //       enctype: 'multipart/form-data',
      //       responseType: 'application/json',
      //     },
      //     body: formData,
      //   },
      // )
      // if (jsonResponse.status !== 200) throw new Error('Prediction failed!')
      // const jsonBlob = await jsonResponse.blob()
      // const jsonUrl = URL.createObjectURL(jsonBlob)
      // setJsonUrl(jsonUrl)

      // // convert blob to json
      // const jsonText = await jsonBlob.text()
      // const jsonResult = JSON.parse(jsonText) as BoundingBox[]
      // setJsonResult(jsonResult)

      void messageAPI.success('Prediction successfully!')
    } catch (error) {
      console.error(error)
      void messageAPI.error('Prediction failed!')
    } finally {
      setIsLoading(false)
      next()
    }
  }

  // effect: to predict automatically if preview is true
  useEffect(() => {
    if (preview === 'true' && imageFile) {
      void handlePredict()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile, preview])

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size="small" style={{ display: 'flex' }}>
        <Typography.Title level={4}>Preview image</Typography.Title>

        <Button
          type="primary"
          loading={isLoading}
          icon={<SearchOutlined />}
          disabled={!imageFile}
          onClick={() => {
            void handlePredict()
          }}>
          Predict
        </Button>
        {/* <Checkbox onClick={handleCheckbox} checked={checkbox}>
          Test mode
        </Checkbox> */}

        {/* <Image
        unoptimized
        src={imageFile ? URL.createObjectURL(imageFile) : '/android-chrome-512x512.png'}
        alt="Image to be predicted"
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
      /> */}
        <Image
          alt="error"
          width={imageFile ? '100%' : '50%'}
          height={imageFile ? '100%' : '50%'}
          src={imageFile ? URL.createObjectURL(imageFile) : 'error'}
          fallback="data:image/png;base64,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"
        />
      </Space>
    </>
  )
}
