import { SearchOutlined } from '@ant-design/icons'
import { Button, Checkbox, message, Space, Typography } from 'antd'
import type { RcFile } from 'antd/es/upload'
import Image from 'next/image'
import { useState } from 'react'
import type {
  DrawingComponent,
  LineType,
  MissingComponent,
  RemainingComponent,
} from '~/models/drawings.model'
import { api } from '~/utils/api'

interface PredictJPEGProps {
  imageFile: File | null
  lineTypes: LineType[]
  setLineTypes: (lineTypes: LineType[]) => void
  drawingComponents: DrawingComponent[]
  setDrawingComponents: (drawingComponents: DrawingComponent[]) => void
  missingComponents: MissingComponent[]
  setMissingComponents: (missingComponents: MissingComponent[]) => void
  remainingComponents: RemainingComponent[]
  setRemainingComponents: (remainingComponents: RemainingComponent[]) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

const PredictJPEG = ({
  imageFile,
  lineTypes,
  setLineTypes,
  drawingComponents,
  setDrawingComponents,
  missingComponents,
  setMissingComponents,
  remainingComponents,
  setRemainingComponents,
  isLoading,
  setIsLoading,
}: PredictJPEGProps) => {
  // hooks
  const [csvUrl, setCsvUrl] = useState('')
  const [checkbox, setCheckbox] = useState(false)

  // trpcs
  const serverGetSelected = api.server.getSelected.useQuery()

  // handlers
  const handleCheckbox = () => {
    setCheckbox(!checkbox)
  }

  const handlePredict = () => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('files[]', imageFile as RcFile)
    // You can use any AJAX library you like
    fetch(`${serverGetSelected?.data?.url}predict?type=csv`, {
      method: 'POST',
      headers: {
        enctype: 'multipart/form-data',
        responseType: 'text/csv',
      },
      body: formData,
    })
      .then(async (res) => {
        const blob = await res.blob()
        if (res.status !== 200) throw new Error('Prediction failed!')

        const csvUrl = URL.createObjectURL(blob)
        setCsvUrl(csvUrl)

        void message.success('Prediction successfully!')
      })
      .catch(() => {
        void message.error('Prediction failed!')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleTestPredict = () => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('files[]', imageFile as RcFile)
    // You can use any AJAX library you like
    fetch(`${serverGetSelected?.data?.url}test-predict?test=${checkbox.toString()}`, {
      method: 'POST',
      headers: {
        enctype: 'multipart/form-data',
        responseType: 'application/json',
      },
      body: formData,
    })
      .then(async (res) => {
        const json = (await res.json()) as {
          line_types: string
          drawing_components: string
          missing_components: string
          remaining_components: string
        }
        if (res.status !== 200) throw new Error('Prediction failed!')

        // parse json
        const lineTypes = JSON.parse(json.line_types) as LineType[]
        const drawingComponents = JSON.parse(json.drawing_components) as DrawingComponent[]
        const missingComponents = JSON.parse(json.missing_components) as MissingComponent[]
        const remainingComponents = JSON.parse(json.remaining_components) as RemainingComponent[]

        setLineTypes(lineTypes)
        setDrawingComponents(drawingComponents)
        setMissingComponents(missingComponents)
        setRemainingComponents(remainingComponents)

        void message.success('Prediction successfully!')
      })
      .catch(() => {
        void message.error('Prediction failed!')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <Space direction="vertical" size="small" style={{ display: 'flex' }}>
      <Typography.Title level={4}>Preview image</Typography.Title>
      <Image
        src={imageFile ? URL.createObjectURL(imageFile) : '/android-chrome-512x512.png'}
        alt="Image to be predicted"
        width={100}
        height={100}
      />
      <Button
        loading={isLoading}
        type={!csvUrl && lineTypes.length === 0 ? 'primary' : 'default'}
        icon={<SearchOutlined />}
        disabled={!imageFile}
        onClick={handlePredict}>
        Predict
      </Button>

      <Button
        type={csvUrl ? 'primary' : 'link'}
        href={csvUrl}
        disabled={!csvUrl}
        download="predictions.csv"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        Download CSV
      </Button>

      <Button
        loading={isLoading}
        type={!csvUrl && lineTypes.length === 0 ? 'primary' : 'default'}
        icon={<SearchOutlined />}
        disabled={!imageFile}
        onClick={handleTestPredict}>
        Predict and display JSON
      </Button>
      <Checkbox onClick={handleCheckbox} checked={checkbox}>
        Test mode
      </Checkbox>
    </Space>
  )
}

export default PredictJPEG
