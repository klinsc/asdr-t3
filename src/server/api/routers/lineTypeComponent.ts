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
      // find next index
      const lineTypeComponents = await ctx.prisma.lineTypeComponent.findMany({
        where: {
          lineTypeId: input.lineTypeId,
        },
      })

      const maxIndex = lineTypeComponents.reduce((acc, lineTypeComponent) => {
        if (lineTypeComponent.index > acc) {
          return lineTypeComponent.index
        }

        return acc
      }, 0)

      return ctx.prisma.lineTypeComponent.create({
        data: {
          componentId: input.componentId,
          count: input.count,
          lineTypeId: input.lineTypeId,
          componentType: input.componentType,
          index: maxIndex + 1,
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
    .mutation(async ({ input, ctx }) => {
      // reassign indexes
      const lineTypeComponentToDelete =
        await ctx.prisma.lineTypeComponent.findUnique({
          where: {
            id: input.lineTypeComponentId,
          },
        })

      if (!lineTypeComponentToDelete) {
        throw new Error('lineTypeComponent not found')
      }

      const lineTypeComponents = await ctx.prisma.lineTypeComponent.findMany({
        where: {
          lineTypeId: lineTypeComponentToDelete.lineTypeId,
        },
      })

      const lineTypeComponentsToUpdate = lineTypeComponents.filter(
        (lineTypeComponent) =>
          lineTypeComponent.index > lineTypeComponentToDelete.index,
      )

      const lineTypeComponentsToUpdateWithNewIndex =
        lineTypeComponentsToUpdate.map((lineTypeComponent) => ({
          ...lineTypeComponent,
          index: lineTypeComponent.index - 1,
        }))

      await Promise.all(
        lineTypeComponentsToUpdateWithNewIndex.map((lineTypeComponent) => {
          return ctx.prisma.lineTypeComponent.update({
            where: {
              id: lineTypeComponent.id,
            },
            data: {
              index: lineTypeComponent.index,
            },
          })
        }),
      )

      return ctx.prisma.lineTypeComponent.delete({
        where: {
          id: input.lineTypeComponentId,
        },
      })
    }),

  upIndex: publicProcedure
    .input(z.object({ lineTypeComponentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const lineTypeComponent = await ctx.prisma.lineTypeComponent.findUnique({
        where: {
          id: input.lineTypeComponentId,
        },
      })

      if (!lineTypeComponent) {
        throw new Error('lineTypeComponent not found')
      }

      const lineTypeComponents = await ctx.prisma.lineTypeComponent.findMany({
        where: {
          lineTypeId: lineTypeComponent.lineTypeId,
        },
      })

      const lineTypeComponentToSwap = lineTypeComponents.find(
        (beingSwappedlineTypeComponent) =>
          beingSwappedlineTypeComponent.index === lineTypeComponent.index - 1,
      )

      if (!lineTypeComponentToSwap) {
        throw new Error('lineTypeComponentToSwap not found')
      }

      await ctx.prisma.lineTypeComponent.update({
        where: {
          id: lineTypeComponent.id,
        },
        data: {
          index: lineTypeComponentToSwap.index,
        },
      })

      return ctx.prisma.lineTypeComponent.update({
        where: {
          id: lineTypeComponentToSwap.id,
        },
        data: {
          index: lineTypeComponent.index,
        },
      })
    }),

  downIndex: publicProcedure
    .input(z.object({ lineTypeComponentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const lineTypeComponent = await ctx.prisma.lineTypeComponent.findUnique({
        where: {
          id: input.lineTypeComponentId,
        },
      })

      if (!lineTypeComponent) {
        throw new Error('lineTypeComponent not found')
      }

      const lineTypeComponents = await ctx.prisma.lineTypeComponent.findMany({
        where: {
          lineTypeId: lineTypeComponent.lineTypeId,
        },
      })

      const lineTypeComponentToSwap = lineTypeComponents.find(
        (beingSwappedlineTypeComponent) =>
          beingSwappedlineTypeComponent.index === lineTypeComponent.index + 1,
      )

      if (!lineTypeComponentToSwap) {
        throw new Error('lineTypeComponentToSwap not found')
      }

      await ctx.prisma.lineTypeComponent.update({
        where: {
          id: lineTypeComponent.id,
        },
        data: {
          index: lineTypeComponentToSwap.index,
        },
      })

      return ctx.prisma.lineTypeComponent.update({
        where: {
          id: lineTypeComponentToSwap.id,
        },
        data: {
          index: lineTypeComponent.index,
        },
      })
    }),
})
