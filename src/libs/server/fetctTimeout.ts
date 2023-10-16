import { type PresetStatusColorType } from 'antd/es/_util/colors'
import { setTimeout } from 'node:timers/promises'

const cancelRequest = new AbortController()
const cancelTimeout = new AbortController()

export async function fetchTimeout({
  url,
  server,
}: {
  url: string
  server: {
    selected: boolean
  }
}) {
  let status: PresetStatusColorType = 'default'

  try {
    const res = await fetch(`${url}health`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    })
    if (server.selected && res.status === 200) {
      status = 'success'
    } else if (server.selected && res.status !== 200) {
      status = 'error'
    }

    return { status }
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(error.message)
    } else {
      console.error(error)
    }

    if (server.selected) {
      status = 'error'
    }

    return { status }
  }
}

export async function timeout({
  server,
}: {
  server: {
    selected: boolean
  }
}) {
  let status: PresetStatusColorType = 'default'

  await setTimeout(5000)
  cancelTimeout.abort()
  cancelRequest.abort()

  if (server.selected) {
    status = 'error'
  }

  return { status }
}
