import { SearchOutlined } from '@ant-design/icons'
import { Button, message, Space, Typography } from 'antd'
import type { RcFile } from 'antd/es/upload'
import Image from 'next/image'
import { useState } from 'react'
import { api } from '~/utils/api'

const PredictJPEG = ({ imageFile }: { imageFile: File | null }) => {
  // hooks
  const [predicting, setPredicting] = useState(false)
  const [csvUrl, setCsvUrl] = useState('')

  // trpcs
  const serverGetSelected = api.server.getSelected.useQuery()

  // handlers
  const handlePredict = () => {
    setPredicting(true)
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
        // the response is a Response instance
        // with the response type set to "text/csv"

        // download the file
        const blob = await res.blob()
        const csvUrl = URL.createObjectURL(blob)
        setCsvUrl(csvUrl)
      })
      .catch(() => {
        void message.error('upload failed.')
      })
      .finally(() => {
        setPredicting(false)
      })
  }

  return (
    <Space direction="vertical" size="small" style={{ display: 'flex' }}>
      <Typography.Title level={5}>Preview image</Typography.Title>
      <Image
        src={imageFile ? URL.createObjectURL(imageFile) : '/android-chrome-512x512.png'}
        alt="Image to be predicted"
        width={100}
        height={100}
      />
      <Button
        loading={predicting}
        type="primary"
        icon={<SearchOutlined />}
        disabled={!imageFile}
        onClick={handlePredict}>
        Predict
      </Button>

      <Button
        type="link"
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
    </Space>
  )
}

export default PredictJPEG
