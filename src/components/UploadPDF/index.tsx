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

export default function UploadPDF({
  imageFile,
  setImageFile,
  next,
  isLoading,
  setIsLoading,
}: UploadPDFProps) {
  // hooks
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // messageAPI
  const [messageAPI, contextHolder] = message.useMessage()

  // trpcs
  const serverGetSelected = api.mlServer.getSelected.useQuery()

  // props
  const props: UploadProps = {
    customRequest: () => {
      const formData = new FormData()
      fileList.forEach((file) => {
        formData.append('image', file as RcFile)
      })
      setIsLoading(true)
      // You can use any AJAX library you like
      fetch(`${serverGetSelected?.data?.url}upload?type=csv`, {
        method: 'POST',
        headers: {
          enctype: 'multipart/form-data',
          responseType: 'arraybuffer',
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      })
        .then(async (res) => {
          const blob = await res.blob()
          if (res.status !== 200) throw new Error('Upload failed')

          setImageFile(blob as File)
        })
        .then(() => {
          void messageAPI.success('upload successfully.')
          next()
        })
        .catch(() => {
          void messageAPI.error('upload failed.')
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
        void messageAPI.error('You can only upload one file')
        return Upload.LIST_IGNORE
      }

      const isImage =
        file.type === 'image/jpg' ||
        file.type === 'image/png' ||
        file.type === 'image/jpeg'
      if (isImage) {
        setImageFile(file)
        next()
        return false
      }

      const isPDF = file.type === 'application/pdf'
      if (!isPDF) {
        void messageAPI.error(`${file.name} is not a pdf file`)
        return Upload.LIST_IGNORE
      }

      setFileList([...fileList, file])

      return true
    },
    fileList,
  }

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Upload {...props}>
          <Button
            icon={<UploadOutlined />}
            loading={isLoading}
            size="large"
            type={'primary'}>
            Select a &nbsp;
            <strong>
              <i>PDF</i>
            </strong>
            &nbsp; File or Drag it here
          </Button>
        </Upload>
      </Space>
    </>
  )
}
