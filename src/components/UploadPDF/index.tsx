import { UploadOutlined } from '@ant-design/icons'
import { Button, message, Space, Upload, type UploadFile, type UploadProps } from 'antd'
import { type RcFile } from 'antd/es/upload'
import { useState } from 'react'

const UploadPDF = ({ setImageFile }: { setImageFile: (imageFile: File | null) => void }) => {
  // hooks
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [imageSrc, setImageSrc] = useState('')

  // handlers
  const handleUpload = () => {
    const formData = new FormData()
    fileList.forEach((file) => {
      formData.append('files[]', file as RcFile)
    })
    setUploading(true)
    // You can use any AJAX library you like
    fetch('http://localhost:5000/upload', {
      method: 'POST',
      headers: {
        enctype: 'multipart/form-data',
        responseType: 'arraybuffer',
      },
      body: formData,
    })
      .then(async (res) => {
        const blob = await res.blob()
        const imageUrl = URL.createObjectURL(blob)
        setImageSrc(imageUrl)

        setImageFile(blob as File)
      })
      .then(() => {
        setFileList([])
        void message.success('upload successfully.')
      })
      .catch(() => {
        void message.error('upload failed.')
      })
      .finally(() => {
        setUploading(false)
      })
  }

  // props
  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      setFileList(newFileList)
    },
    beforeUpload: (file) => {
      // check if more than 1 file
      const isMultiple = fileList.length > 0
      if (isMultiple) {
        void message.error('You can only upload one file')
        return Upload.LIST_IGNORE
      }

      const isPDF = file.type === 'application/pdf'
      if (!isPDF) {
        void message.error(`${file.name} is not a pdf file`)
        return Upload.LIST_IGNORE
      }

      setFileList([...fileList, file])

      return false
    },
    // onChange: (info) => {
    //   console.log(info.fileList);
    // },
    fileList,
  }

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{ marginTop: 16 }}>
        {uploading ? 'Uploading' : 'Start Upload'}
      </Button>
    </Space>
  )
}

export default UploadPDF
