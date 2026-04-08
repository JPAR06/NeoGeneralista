import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import { client, writeClient } from "../../../lib/sanity";
import { addSubscriber } from "../../../lib/sender";

function colorFromName(name = "") {
  const palette = ["#F05A78","#7EDDB8","#818cf8","#fb923c","#a78bfa","#f87171","#34d399","#60a5fa"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function initialsFromName(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Palavra-passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ email: credentials.email.toLowerCase() });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/entrar",
    error: "/auth/erro",
  },
  events: {
    async createUser({ user }) {
      // Fires when a new user is created (Google OAuth first sign-in)
      const email = user.email ?? "";
      const name = user.name ?? "";

      // Create Sanity community member if not duplicate
      client.fetch(`count(*[_type == "membroComunidade" && email == $email])`, { email })
        .then((count) => {
          if (count === 0) {
            return writeClient.create({
              _type: "membroComunidade",
              nome: name,
              email,
              iniciais: initialsFromName(name),
              cor: colorFromName(name),
            });
          }
        })
        .catch((err) => console.error("[sanity] membroComunidade create failed:", err));

      // Add to Sender.net newsletter (Sender handles duplicates via upsert)
      addSubscriber({ email, name })
        .catch((err) => console.error("[sender] subscriber add failed:", err));
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
