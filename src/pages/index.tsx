import { Container } from '@mui/material'
import { Col, Row, Typography } from 'antd'
import Image from 'next/image'

// use theme
import theme from '~/theme/themeConfig'

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Row
        style={{
          background: theme.token?.colorPrimary,
          borderRadius: '6px',
        }}>
        <Col span={12}>
          <Image
            priority
            unoptimized
            src="/images/landing_asdr.webp"
            alt="automatic system to diagnose and recognize electrical components drawing"
            width={600}
            height={600}
            style={{
              borderRadius: '6px',
            }}
          />
        </Col>

        <Col span={12}>
          <Row
            gutter={[0, 16]}
            style={{
              padding: '24px',
            }}>
            <Col span={24}></Col>

            <Col span={24}>
              <Typography.Title
                level={1}
                style={{
                  color: 'white',
                  margin: 0,
                }}>
                Are you tired of doom scrolling through electrical drawings?
                <small>
                  &nbsp;&nbsp;And find out that you have to do it all over
                  again🤔
                </small>
              </Typography.Title>
            </Col>

            <Col span={24}></Col>

            <Col span={24}>
              <Typography.Title
                level={2}
                style={{
                  color: 'white',
                  margin: 0,
                }}>
                asdr is here to help you 🤗
              </Typography.Title>
            </Col>

            <Col span={24}>
              <Typography.Title
                level={3}
                style={{
                  color: 'white',
                  margin: 0,
                }}>
                ⏰ SAVE TIME !
              </Typography.Title>
              <Typography.Title
                level={3}
                style={{
                  color: 'white',
                  margin: 0,
                }}>
                📝 VERY EASY !
              </Typography.Title>
              <Typography.Title
                level={3}
                style={{
                  color: 'white',
                  margin: 0,
                }}>
                📊 HIGH ACCURACY !
              </Typography.Title>
            </Col>

            <Col span={24}></Col>

            <Col span={24}>
              <Typography.Title
                level={5}
                style={{
                  color: 'white',
                  margin: 0,
                }}>
                Get rid of the manual work and let asdr do it for you!
              </Typography.Title>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Typography.Title level={2}>How it works?</Typography.Title>

          <Typography.Paragraph>
            The asdr is a web application that uses machine learning to analyze
            electrical drawings and give you the results.
          </Typography.Paragraph>

          <Typography.Paragraph>
            1. Upload your electrical drawing.
          </Typography.Paragraph>

          <Typography.Paragraph>2. asdr will analyze it.</Typography.Paragraph>

          <Typography.Paragraph>
            3. See what components are in the drawing or missing!
          </Typography.Paragraph>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Typography.Title level={2}>Disclamer</Typography.Title>

          <Typography.Paragraph>
            This project is the thesis of Chatbordin Klinsrisuk for his master
            degree of Engineer Technology at the Sirindhorn International
            Institute of Technology, Thammasat University.
          </Typography.Paragraph>
        </Col>
      </Row>
    </Container>
  )
}
