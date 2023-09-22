import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, Row, message } from 'antd'
import { signIn } from 'next-auth/react'
import { api } from '~/utils/api'

const RegisPage = () => {
  // messageAPI
  const [messageAPI, contextHolder] = message.useMessage()

  // trpcs: create a new user
  const userCreate = api.user.create.useMutation({
    onSuccess: (data) => {
      void signIn('credentials', {
        email: data.email,
        password: data.hash,
        callbackUrl: '/',
      })
    },

    onError: (error) => {
      if (error instanceof Error) void messageAPI.error(error.message)
    },
  })

  // handlers: on finish
  const onFinish = (values: { email: string; password: string }) => {
    void userCreate.mutate({
      email: values.email,
      password: values.password,
    })
  }

  return (
    <Row justify="center" align="middle">
      {contextHolder}
      <Col span={6} style={{ textAlign: 'center' }}>
        <Form name="normal_regis" className="regis-form" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your Email!' }]}>
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your Password!' },
            ]}>
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button">
              Register
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
}

export default RegisPage
