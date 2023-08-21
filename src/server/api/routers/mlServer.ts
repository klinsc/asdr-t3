import type { PresetStatusColorType } from 'antd/es/_util/colors'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const mlServerRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ url: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { url, name } = input
      const { prisma } = ctx

      const server = await prisma.mLServer.create({
        data: {
          url,
          name,
        },
      })

      return server
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const servers = await ctx.prisma.mLServer.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })

    const checkLiveServers = await Promise.all(
      servers.map(async (server) => {
        const { url } = server
        try {
          const res = await fetch(`${url}health`, {
            method: 'GET',
          })
          let status: PresetStatusColorType = 'default'
          if (server.selected && res.status === 200) {
            status = 'success'
          } else if (server.selected && res.status !== 200) {
            status = 'error'
          }

          return { status }
        } catch (error) {
          console.error(error)

          let status: PresetStatusColorType = 'default'
          if (server.selected) {
            status = 'error'
          }

          return { status }
        }
      }),
    )

    const serversWithStatus = servers.map((server, index) => {
      return {
        ...server,
        status: checkLiveServers?.[index]?.status ?? 'default',
      }
    })

    return serversWithStatus
  }),

  getSelected: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.mLServer.findFirst({
      where: {
        selected: true,
      },
    })
  }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const { id } = input
    const { prisma } = ctx

    const server = await prisma.mLServer.delete({
      where: {
        id,
      },
    })

    return server
  }),

  select: publicProcedure
    .input(z.object({ id: z.string(), selected: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const { id, selected } = input
      const { prisma } = ctx

      // deselect all servers
      await prisma.mLServer.updateMany({
        where: {
          selected: true,
        },
        data: {
          selected: false,
        },
      })

      const server = await prisma.mLServer.update({
        where: {
          id,
        },
        data: {
          selected,
        },
      })

      return server
    }),

  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const { id } = input
    const { prisma } = ctx

    const server = await prisma.mLServer.findUnique({
      where: {
        id,
      },
    })

    return server
  }),
})
