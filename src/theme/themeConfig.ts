// theme/themeConfig.ts
import type { ThemeConfig } from 'antd'

const theme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: '#0A72EF',
  },
  components: {
    Layout: {
      headerBg: '#fff',
      // siderBg: '#0A72EF',
      // triggerBg: '#fff',
      // triggerColor: '#0A72EF',
    },
  },
}

export default theme
