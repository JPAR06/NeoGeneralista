import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const client = await clientPromise;
  const db = client.db();

  const users = await db
    .collection("users")
    .find({}, { projection: { name: 1, email: 1, _id: 1 } })
    .toArray();

  return res.status(200).json({
    count: users.length,
    users: users.map((u) => ({ id: u._id, name: u.name, email: u.email })),
  });
}
