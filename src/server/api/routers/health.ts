import { type PresetStatusColorType } from 'antd/es/_util/colors'
import { fetchTimeout, timeout } from '~/libs/server/fetctTimeout'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
// import prisma client to check if prisma is connected
import { PrismaClient } from '@prisma/client'

export const healthRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const health = {
      ml: 'default',
      db: 'default',
    } as {
      ml: PresetStatusColorType
      db: PresetStatusColorType
    }

    // machine learning server
    const server = await ctx.prisma.mLServer.findFirst({
      where: {
        selected: true,
      },
    })
    if (!server || !server.url) {
      health.ml = 'error'
    } else {
      const { url } = server

      const { status } = await Promise.race([
        fetchTimeout({ url, server }),
        timeout({ server }),
      ])

      health.ml = status
    }

    // database server
    const dbUrl = process.env.DATABASE_URL
    console.log(dbUrl)
    if (!dbUrl) {
      health.db = 'error'
    } else {
      // check if prisma is connected
      const prisma = new PrismaClient()
      try {
        await prisma.$connect()
        health.db = 'success'
      } catch (error) {
        health.db = 'error'
      } finally {
        await prisma.$disconnect()
      }
    }

    return health
  }),
})
