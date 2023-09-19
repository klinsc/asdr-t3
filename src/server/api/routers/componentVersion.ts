import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const componentVersionRouter = createTRPCRouter({
  createOne: publicProcedure
    .input(
      z.object({
        name: z.string(),
        emoji: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.componentVersion.create({
        data: {
          name: input.name,
          emoji: input.emoji,
          description: input.description,
        },
      })
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.componentVersion.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })
  }),
  updateOne: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        emoji: z.string().optional(),
        description: z.string().optional(),
        selected: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // check if componentVersion exists
      const componentVersionToUpdate =
        await ctx.prisma.componentVersion.findUnique({
          where: {
            id: input.id,
          },
        })
      if (!componentVersionToUpdate) {
        throw new Error('Component Version not found')
      }

      // check if selected is true
      if (input.selected) {
        // if true, set all other componentVersion to false
        await ctx.prisma.componentVersion.updateMany({
          where: {
            selected: true,
          },
          data: {
            selected: false,
          },
        })
      }

      return ctx.prisma.componentVersion.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          emoji: input.emoji,
          description: input.description,
          selected: input.selected,
        },
      })
    }),

  deleteOne: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.componentVersion.delete({
        where: {
          id: input.id,
        },
      })
    }),
})
