import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const drawingTypeRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.drawingType.findMany({
      where: {
        display: true,
      },
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
              count: lineType.count,
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
              count: lineTypeComponent.count,
              componentType: lineTypeComponent.componentType,
            },
          })
        }),
      )

      return
    }),

  createTemplate: publicProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          count: z.number(),
          clusterLineTypeId: z.string(),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      // create drawingType
      let newDrawingName = 'new drawingType'
      // get existing drawingType with name like 'new drawingType'
      const drawingTypes = await ctx.prisma.drawingType.findMany({
        where: {
          name: {
            startsWith: newDrawingName,
          },
        },
      })
      if (drawingTypes.length > 0) {
        // if exists, increment name
        newDrawingName = `${newDrawingName} (${drawingTypes.length + 1})`
      }
      // create drawingType, name 'new drawingType'
      const drawingType = await ctx.prisma.drawingType.create({
        data: {
          name: newDrawingName,
        },
      })

      // group component base on clusterLineTypeId
      const clusterLineTypeId = input.map(
        (component) => component.clusterLineTypeId,
      )
      // remove duplicates
      const uniqueClusterLineTypeId = Array.from(new Set(clusterLineTypeId))
      // grouped components
      interface GroupedComponent {
        clusterLineTypeId: string
        name: string
        components: typeof input
      }
      const groupedComponents = [] as GroupedComponent[]
      uniqueClusterLineTypeId.map((clusterLineTypeId) => {
        const components = input.filter(
          (component) => component.clusterLineTypeId === clusterLineTypeId,
        )
        groupedComponents.push({
          name: '',
          clusterLineTypeId: clusterLineTypeId,
          components: components,
        })
      })

      // get line type name
      await Promise.all(
        groupedComponents.map(async (groupedComponent) => {
          const lineType = await ctx.prisma.lineType.findUnique({
            where: {
              id: groupedComponent.clusterLineTypeId.split('-')[0],
            },
          })
          if (!lineType) {
            return
          }
          groupedComponent.name = lineType.name
        }),
      )

      await Promise.all(
        groupedComponents.map(async (groupedComponent, index) => {
          // create lineType
          const lineType = await ctx.prisma.lineType.create({
            data: {
              name: groupedComponent.name,
              drawingTypeId: drawingType.id,
              // count: groupedComponent.components.length,
              index,
            },
          })

          // create lineTypeComponents
          await Promise.all(
            groupedComponent.components.map(async (component, index) => {
              await ctx.prisma.lineTypeComponent.create({
                data: {
                  lineTypeId: lineType.id,
                  componentId: component.id,
                  count: component.count,
                  index,
                  componentType: 'optional',
                },
              })
            }),
          )
        }),
      )

      return
    }),
})
