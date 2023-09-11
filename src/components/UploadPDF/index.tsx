import { UploadOutlined } from '@ant-design/icons'
import {
  Button,
  message,
  Space,
  Upload,
  type UploadFile,
  type UploadProps,
} from 'antd'
import { type RcFile } from 'antd/es/upload'
import { useState } from 'react'
import { api } from '~/utils/api'

interface UploadPDFProps {
  imageFile: File | null
  setImageFile: (imageFile: File | null) => void
  next: () => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

const UploadPDF = ({
  imageFile,
  setImageFile,
  next,
  isLoading,
  setIsLoading,
}: UploadPDFProps) => {
  // hooks
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // trpcs
  const serverGetSelected = api.mlServer.getSelected.useQuery()

  // props
  const props: UploadProps = {
    customRequest: () => {
      const formData = new FormData()
      fileList.forEach((file) => {
        formData.append('files[]', file as RcFile)
      })
      setIsLoading(true)
      // You can use any AJAX library you like
      fetch(`${serverGetSelected?.data?.url}upload?type=csv`, {
        method: 'POST',
        headers: {
          enctype: 'multipart/form-data',
          responseType: 'arraybuffer',
        },
        body: formData,
      })
        .then(async (res) => {
          const blob = await res.blob()
          if (res.status !== 200) throw new Error('Upload failed')

          setImageFile(blob as File)
        })
        .then(() => {
          void message.success('upload successfully.')
          next()
        })
        .catch(() => {
          void message.error('upload failed.')
        })
        .finally(() => {
          setFileList([])
          setIsLoading(false)
        })
    },
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

      return true
    },
    fileList,
  }

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Upload {...props}>
        <Button
          icon={<UploadOutlined />}
          loading={isLoading}
          type={
            fileList.length === 0 && imageFile?.length === 0
              ? 'primary'
              : 'default'
          }>
          Select File
        </Button>
      </Upload>
    </Space>
  )
}

export default UploadPDF
