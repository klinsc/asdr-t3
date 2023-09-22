import crypto from 'crypto'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(4).max(100),
        name: z.string().min(1).max(100).nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // hash the password before storing it in the database
      // create a random salt for each user
      const salt = crypto.randomBytes(16).toString('hex')

      // hash the password using the salt
      const hash = crypto
        .scryptSync(input.password, salt, 64, {
          N: 1024,
        })
        .toString('hex')

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          hash,
          salt,
        },
      })

      return user
    }),
})
