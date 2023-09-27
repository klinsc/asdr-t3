import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const drawingTypeRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.drawingType.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })
  }),

  getOne: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.drawingType.findUnique({
        where: {
          id: input.id,
        },
      })
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.drawingType.create({
        data: {
          name: input.name,
          description: input.description,
        },
      })
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional().nullish(),
      }),
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.drawingType.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
        },
      })
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.drawingType.delete({
        where: {
          id: input.id,
        },
      })
    }),
})
