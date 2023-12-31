import { type PresetStatusColorType } from 'antd/es/_util/colors'
import { fetchTimeout, timeout } from '~/libs/server/fetctTimeout'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { env } from '~/env.mjs'

export const healthRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const health = {
      ml: 'default',
      db: 'default',
    } as {
      ml: PresetStatusColorType
      db: PresetStatusColorType
    }

    // database server
    const dbUrl = env.DATABASE_URL
    if (!dbUrl) {
      health.db = 'error'
    } else {
      // check if prisma is connected
      const { prisma } = ctx
      try {
        await prisma.$connect()
        health.db = 'success'
      } catch (error) {
        await prisma.$disconnect()

        health.db = 'error'
        health.ml = 'error'

        return health
      }
    }

    // machine learning server
    const server = await ctx.prisma.mLServer.findFirst({
      where: {
        selected: true,
      },
    })
    if (!server?.url) {
      health.ml = 'error'
    } else {
      const { url } = server

      const { status } = await Promise.race([
        fetchTimeout({ url, server }),
        timeout({ server }),
      ])

      health.ml = status
    }

    return health
  }),
})
