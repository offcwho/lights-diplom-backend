import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const origins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
  app.enableCors({
    origin: origins.includes('*') ? true : origins,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('luxf.light API')
    .setDescription('REST API for the luxf.light store: products, cart, favourites, orders, auth')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT || 9000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`luxf.light API → http://localhost:${port}/api  (docs: /api/docs)`);
}
bootstrap();
