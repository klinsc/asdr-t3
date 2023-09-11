import { Button, Input, type InputRef, message, Space } from 'antd'
import { useRef } from 'react'
import { api } from '~/utils/api'

const App = () => {
  // hooks
  const urlRef = useRef<InputRef>(null)
  const nameRef = useRef<InputRef>(null)

  const server = api.mlServer.create.useMutation({
    onSuccess: () => {
      void message.success('Server created')
    },
    onError: () => {
      void message.error('Server creation failed')
    },
  })

  const handleSubmit = () => {
    if (!urlRef?.current?.input?.value || !nameRef?.current?.input?.value)
      return message.error('Please fill in all fields')
    const url = urlRef?.current?.input.value
    const name = nameRef?.current?.input.value

    server.mutate({
      url,
      name,
    })
  }

  return (
    <Space direction="vertical">
      <Input
        placeholder="http://localhost:5000/"
        addonBefore="URL"
        ref={urlRef}
      />
      <Input placeholder="Machine Learning" addonBefore="Name" ref={nameRef} />
      <Button type="primary" onClick={() => void handleSubmit()}>
        Submit
      </Button>
    </Space>
  )
}

export default App
