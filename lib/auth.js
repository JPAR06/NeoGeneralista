import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export async function getAuthSession(context) {
  return getServerSession(context.req, context.res, authOptions);
}

export function requireAuth(getServerSidePropsFunc) {
  return async (context) => {
    const session = await getAuthSession(context);
    if (!session) {
      return {
        redirect: {
          destination: "/auth/entrar",
          permanent: false,
        },
      };
    }
    if (getServerSidePropsFunc) {
      return getServerSidePropsFunc(context, session);
    }
    return { props: { session } };
  };
}
