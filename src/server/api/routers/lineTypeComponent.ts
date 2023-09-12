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

  // update: publicProcedure
  //   .input(
  //     z.object({
  //       id: z.string(),
  //       name: z.string().optional(),
  //       description: z.string().optional(),
  //     }),
  //   )
  //   .mutation(({ input, ctx }) => {
  //     return ctx.prisma.lineType.update({
  //       where: {
  //         id: input.id,
  //       },
  //       data: {
  //         name: input.name,
  //         description: input.description,
  //       },
  //     })
  //   }),

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
