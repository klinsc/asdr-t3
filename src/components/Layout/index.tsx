import {
  ClusterOutlined,
  FileSearchOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { Container } from '@mui/material'
import {
  Avatar,
  Badge,
  Button,
  Col,
  Layout,
  Menu,
  Row,
  Space,
  theme,
  type MenuProps,
} from 'antd'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { api } from '~/utils/api'

const { Header, Content, Footer } = Layout

type MenuItem = Required<MenuProps>['items'][number]

const App = ({ children }: { children: React.ReactNode }) => {
  // routers
  const router = useRouter()
  const pathname = router.pathname

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

  // // effects: log session
  // useEffect(() => {
  //   console.log('session', session)
  // }, [session])

  const getItem = useMemo(
    () =>
      ({
        label,
        key,
        icon,
        children,
        query,
        // admin,
        disabled,
      }: {
        label: React.ReactNode
        key: React.Key
        icon?: React.ReactNode
        children?: MenuItem[]
        query?: Record<string, string | string[] | undefined>
        admin?: boolean
        disabled?: boolean
      }): MenuItem => {
        return {
          key,
          icon,
          children,
          label,
          onClick: () => {
            // if (admin && session?.user?.role !== 'ADMIN')
            //   return void router.push('auth/login/', {
            //     query: {
            //       callbackUrl: router.pathname,
            //     },
            //   })

            void router.push({
              pathname: `${key}`,
              query,
            })
          },
          disabled,
        } as MenuItem
      },
    [router],
  )

  const siderItems = useMemo(
    () => [
      getItem({
        label: 'Home',
        key: '/',
        icon: <HomeOutlined />,
      }),
      getItem({
        label: 'Diagnose a Drawing',
        key: 'diagnose',
        icon: <FileSearchOutlined />,
      }),
      getItem({
        label: 'Drawing Types',
        key: 'drawingtypes',
        icon: <ClusterOutlined />,
        query: {
          tab: '1',
        },
      }),
      // getItem({
      //   label:
      //     session?.user?.role !== 'admin'
      //       ? 'Admin only '
      //       : 'Machine Learning Server',
      //   key: 'server',
      //   icon: <DesktopOutlined />,
      //   admin: true,
      //   // disabled:
      //   //   router.pathname === '/server' || router.pathname.includes('/auth'),
      // }),
    ],
    [getItem],
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
        <Header
          // fix at top
          style={{
            position: 'fixed',
            zIndex: 1,
            width: '100%',
          }}>
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
                <Menu
                  mode="horizontal"
                  items={siderItems}
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  selectedKeys={[pathname.split('/')[1] || '/']}
                  style={{
                    borderBottom: 'none',
                  }}
                />
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
            marginTop: 64,
            padding: '24px 24px',
            minHeight: 280,
          }}>
          {children}
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          <Row justify="center" align="middle">
            <Col span={24}>
              asdr ©2023 Created by Chatbordin Klinsrisuk, m6422040904,
              Thammasat University, Thailand
            </Col>

            <Col span={24}>
              <Space>
                <Button
                  type="link"
                  onClick={() => {
                    if (session?.user?.role !== 'ADMIN')
                      return void router.push('auth/login/', {
                        query: {
                          callbackUrl: router.pathname,
                        },
                      })

                    void router.push('/server')
                  }}>
                  admin
                </Button>
                {session?.user?.role === 'ADMIN' && (
                  <Button
                    type="link"
                    onClick={() => {
                      void signOut()
                    }}>
                    sign out
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Footer>
      </Layout>
    </Layout>
  )
}

export default App
