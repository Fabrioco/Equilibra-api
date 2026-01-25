import { createApp } from "./app";
import { prisma } from "./lib/prisma";

const port = process.env.PORT;
const app = createApp();

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log("banco de dados conectado");
    app.listen(port, () =>
      console.log(
        `servidor rodando http://localhost:${port}`,
      ),
    );
  } catch (error) {
    console.log("erro ao conectar com o banco", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
