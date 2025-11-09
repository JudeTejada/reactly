import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug"],
  });

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('ALLOWED_ORIGINS')?.split(",") || "*",
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  app.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("Reactly API")
    .setDescription("AI-Driven User Feedback & Sentiment Analysis API")
    .setVersion("1.0")
    .addBearerAuth()
    .addApiKey(
      {
        type: "apiKey",
        name: "x-api-key",
        in: "header",
      },
      "api-key"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`\n🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API docs: http://localhost:${port}/api/docs`);
  console.log(`❤️  Health check: http://localhost:${port}/health\n`);
}

bootstrap();
