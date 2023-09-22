import {
  ClusterOutlined,
  DesktopOutlined,
  FileSearchOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { Container } from '@mui/material'
import {
  Avatar,
  Badge,
  Col,
  Layout,
  Menu,
  Row,
  Space,
  theme,
  type MenuProps,
} from 'antd'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { api } from '~/utils/api'

const { Header, Content, Footer } = Layout

type MenuItem = Required<MenuProps>['items'][number]

const App = ({ children }: { children: React.ReactNode }) => {
  // routers
  const router = useRouter()

  // session
  const { data: session } = useSession()

  // trpcs
  const healthServer = api.health.getAll.useQuery(undefined, {
    staleTime: 1000,
  })

  const {
    token: { colorBgContainer },
  } = theme.useToken()

  // const [collapsed, setCollapsed] = useState(true)

  // // effects: set collapsed as value from local storage
  // useEffect(() => {
  //   const collapsed = localStorage.getItem('asdr-sider-collapsed') === 'true'
  //   setCollapsed(collapsed)
  // }, [])

  const getItem = useMemo(
    () =>
      (
        label: React.ReactNode,
        key: React.Key,
        icon?: React.ReactNode,
        children?: MenuItem[],
        query?: Record<string, string | string[] | undefined>,
        disabled?: boolean,
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
          disabled: disabled ?? false,
        } as MenuItem
      },
    [router],
  )

  const siderItems = useMemo(
    () => [
      getItem('Home', '/', <HomeOutlined />),
      getItem('Diagnose a Drawing', '/diagnose', <FileSearchOutlined />),
      getItem('Drawing Type Map', 'map', <ClusterOutlined />, undefined, {
        tab: '1',
      }),
      getItem(
        session?.user?.role !== 'admin'
          ? 'Admin only '
          : 'Machine Learning Server',
        'server',
        <DesktopOutlined />,
        undefined,
        undefined,
        session?.user?.role !== 'admin',
      ),
    ],
    [getItem, session?.user?.role],
  )

  // const authItems: MenuProps['items'] = [
  //   {
  //     label: 'Sign out',
  //     key: '3',
  //     onClick: () => void signOut(),
  //   },
  // ]

  return (
    <Layout>
      {/* <Sider
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
          items={siderItems}
          style={{ height: '100%' }}
        />
      </Sider> */}

      <Layout style={{ background: colorBgContainer, minHeight: 1024 }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <Container maxWidth="lg">
            <Row
              justify="center"
              align="middle"
              style={{
                width: '100%',
              }}>
              {/* Logo */}
              <Col
                span={2}
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => void router.push('/')}>
                <Space>
                  <Avatar
                    shape="square"
                    size="large"
                    src="/images/logo_asdr.webp"
                  />
                </Space>
              </Col>

              {/* Center */}
              <Col span={14}>
                <Menu mode="horizontal" items={siderItems} />
              </Col>

              {/* Auth Menu */}
              <Col
                span={8}
                style={{
                  textAlign: 'right',
                }}>
                <Space>
                  <Badge
                    status={
                      healthServer.isFetching || healthServer.isLoading
                        ? 'processing'
                        : healthServer?.data?.ml ?? 'error'
                    }
                    text={'ML'}
                    // style={{
                    //   color: 'white',
                    // }}
                  />
                  <Badge
                    status={
                      healthServer.isFetching || healthServer.isLoading
                        ? 'processing'
                        : healthServer?.data?.db ?? 'error'
                    }
                    text={'DB'}
                    // style={{
                    //   color: 'white',
                    // }}
                  />
                  {/* {session?.user ? (
                    <Dropdown menu={{ items: authItems }} trigger={['click']}>
                      <a
                        onClick={(e) => e.preventDefault()}
                        // style={{
                        //   color: 'white',
                        // }}>
                        <Space>
                          {session?.user?.email ?? 'Guest'}
                          <DownOutlined />
                        </Space>
                      </a>
                    </Dropdown>
                  ) : (
                    <Button
                      type="default"
                      onClick={() => void router.push('/auth/login')}>
                      Login
                    </Button>
                  )} */}
                </Space>
              </Col>
            </Row>
          </Container>
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
