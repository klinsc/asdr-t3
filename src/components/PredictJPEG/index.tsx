import { SearchOutlined } from '@ant-design/icons'
import { Button, message, Space, Typography } from 'antd'
import type { RcFile } from 'antd/es/upload'
import Image from 'next/image'
import { useState } from 'react'

const PredictJPEG = ({ imageFile }: { imageFile: File | null }) => {
  // hooks
  const [uploading, setUploading] = useState(false)
  const [csvUrl, setCsvUrl] = useState('')

  // handlers
  const handlePredict = () => {
    const formData = new FormData()
    formData.append('files[]', imageFile as RcFile)
    // You can use any AJAX library you like
    fetch('http://localhost:5000/predict?type=csv', {
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
        setUploading(false)
      })
  }

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Typography.Title level={5}>Send to prediction</Typography.Title>
      <Image
        src={imageFile ? URL.createObjectURL(imageFile) : ''}
        alt="Fetched"
        width={100}
        height={100}
      />
      <Button loading={uploading} type="primary" icon={<SearchOutlined />} onClick={handlePredict}>
        Predict JPEG
      </Button>

      <Button
        type="link"
        href={csvUrl}
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
