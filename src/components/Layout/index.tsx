import { DesktopOutlined, FileSearchOutlined } from '@ant-design/icons'
import {
  Badge,
  Col,
  Layout,
  Menu,
  Row,
  Typography,
  theme,
  type MenuProps,
  Space,
} from 'antd'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'
import { api } from '~/utils/api'

const { Header, Content, Footer, Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

const App = ({ children }: { children: React.ReactNode }) => {
  // routers
  const router = useRouter()

  // trpcs
  const healthServer = api.health.getAll.useQuery(undefined, {
    staleTime: 1000,
  })

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
    ],
    [getItem],
  )

  return (
    <Layout>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}>
        <div
          className="demo-logo-vertical"
          style={{
            height: 64,
            width: '100%',
          }}
        />
        <Menu
          defaultSelectedKeys={['1']}
          mode="inline"
          items={items}
          style={{ height: '100%' }}
        />
      </Sider>

      <Layout style={{ background: colorBgContainer, minHeight: 1024 }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <Row
            justify="center"
            align="middle"
            style={{
              width: '100%',
            }}>
            <Col span={4} style={{ textAlign: 'center' }}>
              <Typography.Paragraph
                style={{
                  color: 'white',
                  margin: 0,
                }}>
                Chatbordin Klinsrisuk
              </Typography.Paragraph>
            </Col>

            {/* Logo */}
            <Col
              span={14}
              style={{
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Typography.Title
                level={3}
                style={{
                  color: 'white',
                  margin: 0,
                }}>
                ASDR&nbsp;
              </Typography.Title>
              <FileSearchOutlined
                style={{
                  color: 'white',
                }}
              />
              <Typography.Title
                level={5}
                style={{
                  color: 'white',
                  margin: 0,
                }}>
                Automatic System to Diagnose and Recognize Electrical Drawings
              </Typography.Title>
            </Col>

            <Col
              span={4}
              style={{
                textAlign: 'center',
              }}>
              <Space>
                <Badge
                  status={healthServer?.data?.ml ?? 'error'}
                  text={'ML'}
                  style={{
                    color: 'white',
                  }}
                />
                <Badge
                  status={healthServer?.data?.db ?? 'error'}
                  text={'DB'}
                  style={{
                    color: 'white',
                  }}
                />
              </Space>
            </Col>
          </Row>
        </Header>

        <Content
          style={{
            padding: '24px 24px',
            minHeight: 280,
          }}>
          {children}
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          ASDR ©2023 Created by Chatbordin Klinsrisuk
        </Footer>
      </Layout>
    </Layout>
  )
}

export default App
