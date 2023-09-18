import { z } from 'zod'
import { fetchTimeout, timeout } from '~/libs/server/fetctTimeout'
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

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        url: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, url, name, description } = input
      const { prisma } = ctx

      const server = await prisma.mLServer.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          url,
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
        const { status: result } = await Promise.race([
          fetchTimeout({ url, server }),
          timeout({ server }),
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
