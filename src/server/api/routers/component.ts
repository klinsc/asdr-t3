import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const componentRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.component.findMany({
      orderBy: {
        index: 'asc',
      },
    })
  }),

  updateAll: publicProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullish(),
          color: z.string(),
          partId: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      await Promise.all(
        input.map(async (component) => {
          const componentToUpdate = await ctx.prisma.component.findUnique({
            where: {
              id: component.id,
            },
          })
          if (componentToUpdate) {
            return ctx.prisma.component.update({
              where: {
                id: component.id,
              },
              data: {
                name: component.name,
                description: component.description,
                color: component.color,
                partId: component.partId,
                createdAt: component.createdAt,
                updatedAt: component.updatedAt,
              },
            })
          }
        }),
      )
    }),

  getAllPartx: publicProcedure.query(async ({ ctx }) => {
    const parts = await ctx.prisma.part.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return parts
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

  // create: publicProcedure
  //   .input(
  //     z.object({
  //       name: z.string(),
  //       description: z.string().optional(),
  //       drawingTypeId: z.string(),
  //     }),
  //   )
  //   .mutation(async ({ input, ctx }) => {
  //     // the name with the same drawingTypeId should be unique
  //     const lineType = await ctx.prisma.lineType.findFirst({
  //       where: {
  //         name: input.name,
  //         drawingTypeId: input.drawingTypeId,
  //       },
  //     })

  //     if (lineType) {
  //       throw new Error('The name with the same drawingTypeId should be unique')
  //     }

  //     return ctx.prisma.lineType.create({
  //       data: {
  //         name: input.name,
  //         description: input.description,
  //         drawingTypeId: input.drawingTypeId,
  //       },
  //     })
  //   }),

  updateOneComponent: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        partId: z.string().optional(),
      }),
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.component.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
          color: input.color,
          partId: input.partId,
          updatedAt: new Date(),
        },
      })
    }),

  // delete: publicProcedure
  //   .input(z.object({ id: z.string() }))
  //   .mutation(({ input, ctx }) => {
  //     return ctx.prisma.lineType.delete({
  //       where: {
  //         id: input.id,
  //       },
  //     })
  //   }),
})
