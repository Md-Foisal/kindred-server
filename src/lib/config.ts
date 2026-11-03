import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env variable: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: required("MONGODB_URI"),
  dbName: process.env.DB_NAME || "kindred",
  clientUrl: required("CLIENT_URL").replace(/\/$/, ""),
};
