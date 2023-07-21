import { DesktopOutlined, FileSearchOutlined } from '@ant-design/icons'
import { Col, Layout, Menu, Row, theme, Typography, type MenuProps } from 'antd'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'

const { Header, Content, Footer, Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

const App = ({ children }: { children: React.ReactNode }) => {
  // routers
  const router = useRouter()

  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const [collapsed, setCollapsed] = useState(true)

  const getItem = useMemo(
    () =>
      (
        label: React.ReactNode,
        key: React.Key,
        icon?: React.ReactNode,
        children?: MenuItem[],
      ): MenuItem => {
        return {
          key,
          icon,
          children,
          label,
          onClick: () => {
            void router.push(`/${key}`)
          },
        } as MenuItem
      },
    [router],
  )

  const items = useMemo(
    () => [
      getItem('Diagnose a Drawing', '/', <FileSearchOutlined />),
      getItem('Machine Learning Server', 'server', <DesktopOutlined />),

      // getItem('User', 'sub1', <UserOutlined />, [
      //   getItem('Tom', '3'),
      //   getItem('Bill', '4'),
      //   getItem('Alex', '5'),
      // ]),

      // getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
      // getItem('Files', '9', <FileOutlined />),
    ],
    [getItem],
  )

  return (
    <Layout>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div
          className="demo-logo-vertical"
          style={{
            height: 64,
            width: '100%',
          }}
        />
        <Menu defaultSelectedKeys={['1']} mode="inline" items={items} style={{ height: '100%' }} />
      </Sider>

      <Layout style={{ background: colorBgContainer, minHeight: 1024 }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <Row
            justify="center"
            align="middle"
            style={{
              width: '100%',
            }}>
            {/* Logo */}
            <Col
              span={24}
              style={{
                textAlign: 'center',
              }}>
              <div className="demo-logo" />
              <Typography.Title
                level={3}
                style={{
                  color: 'white',
                  margin: 0,
                  marginLeft: 16,
                }}>
                ASDR: Automatic System to Diagnose and Recognize Electrical Drawings
              </Typography.Title>
            </Col>
          </Row>
        </Header>

        <Content style={{ padding: '0 24px', minHeight: 280 }}>{children}</Content>

        <Footer style={{ textAlign: 'center' }}>Ant Design ©2023 Created by Ant UED</Footer>
      </Layout>
    </Layout>
  )
}

export default App
