import { Container } from '@mui/material'
import { Tabs } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ComponentList from '~/components/Map/ComponentList'
import { DrawingType } from '~/components/Map/DrawingType'
import { DrawingTypeDev } from '~/components/Map/DrawingTypeDev'
import { LineType } from '~/components/Map/LineType'

export default function Map() {
  // router
  const router = useRouter()
  const { tab } = router.query

  // const
  const items = [
    {
      label: 'Drawing Types',
      key: '1',
      children: <DrawingType />,
    },
    {
      label: 'Line Types',
      key: '2',
      children: <LineType />,
    },
    {
      label: 'Components',
      key: '3',
      children: <ComponentList />,
    },
    {
      label: 'Drawing Types',
      key: '4',
      children: <DrawingTypeDev />,
    },
  ]

  // handlers
  const onTabClick = (key: string) => {
    void router.push({
      pathname: '/map',
      query: { tab: key },
    })
  }

  return (
    <>
      <Head>
        <title>asdr | Machine Learning Server</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="lg">
        <Tabs
          type="card"
          size={'large'}
          items={items}
          onChange={onTabClick}
          activeKey={(tab as string) ?? '1'}
        />
      </Container>
    </>
  )
}
