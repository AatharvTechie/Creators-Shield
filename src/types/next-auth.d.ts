
import type { DefaultSession } from 'next-auth';
import type { JWT } from "next-auth/jwt"

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      youtubeChannelId?: string;
    } & DefaultSession['user'];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    youtubeChannelId?: string;
  }
}
