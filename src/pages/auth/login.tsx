import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, Row, Space, message } from 'antd'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'

const LoginPage = () => {
  //router
  const router = useRouter()
  const { callbackUrl } = router.query

  // messageAPI
  const [messageAPI, contextHolder] = message.useMessage()

  const onFinish = (values: { username: string; password: string }) => {
    signIn('credentials', {
      username: values.username,
      password: values.password,
      // callbackUrl: (callbackUrl as string) ?? '/',
    })
      .then(() => {
        void router.push((callbackUrl as string) ?? '/')
      })
      .catch((error) => {
        if (error instanceof Error) void messageAPI.error(error.message)
      })
  }

  return (
    <Row justify="center" align="middle">
      {contextHolder}
      <Col span={6} style={{ textAlign: 'center' }}>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please input your Username!' },
            ]}>
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
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
            <Space>
              <Button type="link" href="/auth/regis">
                Register
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button">
                Log in
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
}

export default LoginPage
