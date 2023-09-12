import { Container } from '@mui/material'
import { Tabs } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { DrawingType } from '~/components/Map/DrawingType'

export default function Map() {
  // router
  const router = useRouter()

  // const
  const items = [
    {
      label: 'Drawing Type',
      key: '1',
      children: <DrawingType />,
    },
    {
      label: 'Line Type',
      key: '2',
      children: 'Content of Tab Pane 2',
    },
    {
      label: 'Line Type Component',
      key: '3',
      children: 'Content of Tab Pane 3',
    },
  ]

  // handlers
  const onTabClick = (key: string) => {
    void router.push({
      pathname: '/map',
      query: { tab: key },
    })
  }

  // effects: redirect to tab 1 when first load
  useEffect(() => {
    void router.push({
      pathname: '/map',
      query: { tab: '1' },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Head>
        <title>ASDR: Machine Learning Server</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="lg">
        <Tabs type="card" items={items} onChange={onTabClick} />
      </Container>
    </>
  )
}
