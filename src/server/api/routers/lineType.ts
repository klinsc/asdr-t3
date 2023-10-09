import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const lineTypeRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ drawingTypeId: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.lineType.findMany({
        orderBy: {
          index: 'asc',
        },
        where: {
          drawingTypeId: input.drawingTypeId,
        },
      })
    }),

  getAllWithComponents: publicProcedure
    .input(z.object({ drawingTypeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const lineTypes = await ctx.prisma.lineType.findMany({
        orderBy: {
          index: 'asc',
        },
        where: {
          drawingTypeId: input.drawingTypeId,
        },
      })

      const lineTypeComponents = await ctx.prisma.lineTypeComponent.findMany({
        where: {
          lineTypeId: {
            in: lineTypes.map((lineType) => lineType.id),
          },
        },
        include: {
          Component: true,
        },
        orderBy: {
          index: 'asc',
        },
      })

      return lineTypes.map((lineType) => {
        return {
          ...lineType,
          lineTypeComponents: lineTypeComponents.filter(
            (lineTypeComponent) => lineTypeComponent.lineTypeId === lineType.id,
          ),
        }
      })
    }),

  getOne: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.lineType.findUnique({
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
        drawingTypeId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // the name with the same drawingTypeId should be unique
      const lineType = await ctx.prisma.lineType.findFirst({
        where: {
          name: input.name,
          drawingTypeId: input.drawingTypeId,
        },
      })

      if (lineType) {
        throw new Error('The name with the same drawingTypeId should be unique')
      }

      // find last index of lineType of the same drawingTypeId
      const lastIndex = await ctx.prisma.lineType.findFirst({
        where: {
          drawingTypeId: input.drawingTypeId,
        },
        orderBy: {
          index: 'desc',
        },
      })

      return ctx.prisma.lineType.create({
        data: {
          name: input.name,
          description: input.description,
          drawingTypeId: input.drawingTypeId,
          index: lastIndex ? lastIndex.index + 1 : 0,
        },
      })
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.lineType.update({
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
      return ctx.prisma.lineType.delete({
        where: {
          id: input.id,
        },
      })
    }),

  upIndex: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const lineType = await ctx.prisma.lineType.findUnique({
        where: {
          id: input.id,
        },
      })

      if (!lineType) {
        throw new Error('lineType not found')
      }

      // check if the lineType is the first one
      if (lineType.index === 0) {
        throw new Error('lineType is the first one')
      }

      const prevLineType = await ctx.prisma.lineType.findFirst({
        where: {
          index: {
            lt: lineType.index,
          },
          drawingTypeId: lineType.drawingTypeId,
        },
        orderBy: {
          index: 'desc',
        },
      })

      if (!prevLineType) {
        throw new Error('prevLineType not found')
      }

      await ctx.prisma.lineType.update({
        where: {
          id: lineType.id,
        },
        data: {
          index: prevLineType.index,
        },
      })

      await ctx.prisma.lineType.update({
        where: {
          id: prevLineType.id,
        },
        data: {
          index: lineType.index,
        },
      })

      return
    }),

  downIndex: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const lineType = await ctx.prisma.lineType.findUnique({
        where: {
          id: input.id,
        },
      })

      if (!lineType) {
        throw new Error('lineType not found')
      }

      // check if the lineType is the last one
      const lastLineType = await ctx.prisma.lineType.findFirst({
        where: {
          drawingTypeId: lineType.drawingTypeId,
        },
        orderBy: {
          index: 'desc',
        },
      })

      if (!lastLineType) {
        throw new Error('lastLineType not found')
      }

      if (lineType.index === lastLineType.index) {
        throw new Error('lineType is the last one')
      }

      const nextLineType = await ctx.prisma.lineType.findFirst({
        where: {
          index: {
            gt: lineType.index,
          },
          drawingTypeId: lineType.drawingTypeId,
        },
        orderBy: {
          index: 'asc',
        },
      })

      if (!nextLineType) {
        throw new Error('nextLineType not found')
      }

      await ctx.prisma.lineType.update({
        where: {
          id: lineType.id,
        },
        data: {
          index: nextLineType.index,
        },
      })

      await ctx.prisma.lineType.update({
        where: {
          id: nextLineType.id,
        },
        data: {
          index: lineType.index,
        },
      })

      return
    }),

  duplicate: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const lineType = await ctx.prisma.lineType.findUnique({
        where: {
          id: input.id,
        },
      })

      if (!lineType) {
        throw new Error('lineType not found')
      }

      const lineTypeComponents = await ctx.prisma.lineTypeComponent.findMany({
        where: {
          lineTypeId: lineType.id,
        },
      })

      const newLineType = await ctx.prisma.lineType.create({
        data: {
          name: lineType.name,
          description: lineType.description,
          drawingTypeId: lineType.drawingTypeId,
          index: lineType.index + 1,
        },
      })

      await Promise.all(
        lineTypeComponents.map(async (lineTypeComponent) => {
          await ctx.prisma.lineTypeComponent.create({
            data: {
              lineTypeId: newLineType.id,
              componentId: lineTypeComponent.componentId,
              index: lineTypeComponent.index,
            },
          })
        }),
      )

      return newLineType
    }),
})
