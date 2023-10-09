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
    .mutation(async ({ input, ctx }) => {
      // check if drawingType exists
      const drawingType = await ctx.prisma.drawingType.findUnique({
        where: {
          id: input.id,
        },
      })

      if (!drawingType) {
        throw new Error('drawingType not found')
      }

      // check if drawingType has lineTypes
      const lineTypes = await ctx.prisma.lineType.findMany({
        where: {
          drawingTypeId: input.id,
        },
      })

      // delete lineTypeComponents
      await ctx.prisma.lineTypeComponent.deleteMany({
        where: {
          lineTypeId: {
            in: lineTypes.map((lineType) => lineType.id),
          },
        },
      })

      // delete lineTypes
      await ctx.prisma.lineType.deleteMany({
        where: {
          drawingTypeId: input.id,
        },
      })

      return ctx.prisma.drawingType.delete({
        where: {
          id: input.id,
        },
      })
    }),

  duplicate: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // check if drawingType exists
      const drawingType = await ctx.prisma.drawingType.findUnique({
        where: {
          id: input.id,
        },
      })
      // if not, throw error
      if (!drawingType) {
        throw new Error('drawingType not found')
      }

      // create new drawingType
      const newDrawingType = await ctx.prisma.drawingType.create({
        data: {
          name: input.name,
          description: drawingType.description,
        },
      })

      // get lineTypes of existing drawingType
      const lineTypes = await ctx.prisma.lineType.findMany({
        where: {
          drawingTypeId: drawingType.id,
        },
      })

      // get lineTypeComponents of existing drawingType
      const lineTypeComponents = await ctx.prisma.lineTypeComponent.findMany({
        where: {
          lineTypeId: {
            in: lineTypes.map((lineType) => lineType.id),
          },
        },
      })

      // create new lineTypes
      const lineTypePairs = await Promise.all(
        lineTypes.map(async (lineType) => {
          const newLineType = await ctx.prisma.lineType.create({
            data: {
              name: lineType.name,
              description: lineType.description,
              drawingTypeId: newDrawingType.id,
              index: lineType.index,
            },
          })

          return {
            oldId: lineType.id,
            newId: newLineType.id,
          }
        }),
      )

      // create new lineTypeComponents
      await Promise.all(
        lineTypeComponents.map(async (lineTypeComponent) => {
          const newLineTypeId = lineTypePairs.find(
            (lineTypePair) =>
              lineTypePair.oldId === lineTypeComponent.lineTypeId,
          )?.newId
          if (!newLineTypeId) {
            return
          }

          return ctx.prisma.lineTypeComponent.create({
            data: {
              lineTypeId: newLineTypeId,
              componentId: lineTypeComponent.componentId,
              index: lineTypeComponent.index,
            },
          })
        }),
      )

      return
    }),
})
