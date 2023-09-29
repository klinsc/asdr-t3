import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const lineTypeComponentRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ lineTypeId: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.lineTypeComponent.findMany({
        where: {
          lineTypeId: input.lineTypeId,
        },
        include: {
          Component: true,
        },

        // order by component name asc
        orderBy: {
          Component: {
            name: 'asc',
          },
        },
      })
    }),

  // getOne: publicProcedure
  //   .input(z.object({ id: z.string() }))
  //   .query(({ input, ctx }) => {
  //     return ctx.prisma.lineType.findUnique({
  //       where: {
  //         id: input.id,
  //       },
  //     })
  //   }),

  create: publicProcedure
    .input(
      z.object({
        componentId: z.string(),
        count: z.number(),
        lineTypeId: z.string(),
        componentType: z.enum(['mandatory', 'optional']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.lineTypeComponent.create({
        data: {
          componentId: input.componentId,
          count: input.count,
          lineTypeId: input.lineTypeId,
          componentType: input.componentType,
        },
      })
    }),

  update: publicProcedure
    .input(
      z.object({
        lineTypeComponentId: z.string(),
        componentId: z.string(),
        count: z.number(),
        lineTypeId: z.string(),
        componentType: z.enum(['mandatory', 'optional']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const lineTypeComponentToUpdate =
        await ctx.prisma.lineTypeComponent.findUnique({
          where: {
            id: input.lineTypeComponentId,
          },
        })

      if (!lineTypeComponentToUpdate) {
        throw new Error('lineTypeComponent not found')
      }

      return ctx.prisma.lineTypeComponent.update({
        where: {
          id: input.lineTypeComponentId,
        },
        data: {
          componentId: input.componentId,
          count: input.count,
          lineTypeId: input.lineTypeId,
          componentType: input.componentType,
        },
      })
    }),

  delete: publicProcedure
    .input(z.object({ lineTypeComponentId: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.lineTypeComponent.delete({
        where: {
          id: input.lineTypeComponentId,
        },
      })
    }),
})
