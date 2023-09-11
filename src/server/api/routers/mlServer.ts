import type { PresetStatusColorType } from 'antd/es/_util/colors'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { setTimeout } from 'node:timers/promises'

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
        let status: PresetStatusColorType = 'default'
        const cancelRequest = new AbortController()
        const cancelTimeout = new AbortController()

        async function fetchTimeout() {
          try {
            const res = await fetch(`${url}health`, {
              method: 'GET',
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

        async function timeout() {
          await setTimeout(1000)
          cancelTimeout.abort()
          cancelRequest.abort()

          if (server.selected) {
            status = 'error'
          }

          return { status }
        }

        const { status: result } = await Promise.race([
          fetchTimeout(),
          timeout(),
        ])

        return { status: result }
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

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
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

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
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
