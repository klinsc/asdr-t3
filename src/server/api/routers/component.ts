import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const componentRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.component.findMany({
      orderBy: {
        createdAt: 'asc',
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
