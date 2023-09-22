import {
  ClusterOutlined,
  DesktopOutlined,
  FileSearchOutlined,
} from '@ant-design/icons'
import { css, cx } from '@emotion/css'
import {
  Badge,
  Col,
  Layout,
  Menu,
  Row,
  Space,
  Typography,
  theme,
  type MenuProps,
} from 'antd'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { api } from '~/utils/api'

const hover = css`
  &:hover {
    text-decoration: underline;
  }
`

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

  // effects: set collapsed as value from local storage
  useEffect(() => {
    const collapsed = localStorage.getItem('asdr-sider-collapsed') === 'true'
    setCollapsed(collapsed)
  }, [])

  const getItem = useMemo(
    () =>
      (
        label: React.ReactNode,
        key: React.Key,
        icon?: React.ReactNode,
        children?: MenuItem[],
        query?: Record<string, string | string[] | undefined>,
      ): MenuItem => {
        return {
          key,
          icon,
          children,
          label,
          onClick: () => {
            void router.push({
              pathname: `/${key}`,
              query,
            })
          },
        } as MenuItem
      },
    [router],
  )

  const items = useMemo(
    () => [
      getItem('Diagnose a Drawing', '/', <FileSearchOutlined />),
      getItem('Drawing Type Map', 'map', <ClusterOutlined />, undefined, {
        tab: '1',
      }),
      getItem('Machine Learning Server', 'server', <DesktopOutlined />),
    ],
    [getItem],
  )

  return (
    <Layout>
      <Sider
        width={256}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => {
          setCollapsed(value)
          localStorage.setItem('asdr-sider-collapsed', value.toString())
        }}>
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
                className={cx(hover)}
                style={{
                  color: 'white',
                  margin: 0,
                  cursor: 'pointer',
                }}
                onClick={() =>
                  window.open('https://chatbordin.com/', '_blank', 'noopener')
                }>
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
                cursor: 'pointer',
              }}
              onClick={() => void router.push('/')}>
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
                  status={
                    healthServer.isFetching || healthServer.isLoading
                      ? 'processing'
                      : healthServer?.data?.ml ?? 'error'
                  }
                  text={'ML'}
                  style={{
                    color: 'white',
                  }}
                />
                <Badge
                  status={
                    healthServer.isFetching || healthServer.isLoading
                      ? 'processing'
                      : healthServer?.data?.db ?? 'error'
                  }
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
