import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './modules/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  app.setGlobalPrefix('api');

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('SD Thai Food API')
    .setDescription('Complete API documentation for SD Thai Food platform - Restaurant management system with partner sessions, POS, returns, and stock management')
    .setVersion('0.4.1')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('partners', 'Partner management')
    .addTag('products', 'Product catalog')
    .addTag('orders', 'Order management with deadline validation')
    .addTag('partner-sessions', 'Partner authentication sessions')
    .addTag('pos', 'Point of Sale transactions')
    .addTag('returns', 'Product returns management')
    .addTag('stock', 'Stock management (SALE/DEMO/STAFF)')
    .addTag('health', 'Health check')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'SD Thai Food API Documentation',
    customfavIcon: 'https://docs.nestjs.com/assets/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #e74c3c }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3001');
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
  });

  // Shutdown hooks removed - not needed with Prisma 5.x library engine
  // Prisma automatically handles cleanup on process exit

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API is available at: http://localhost:${port}/api`);
  console.log(`Health check: http://localhost:${port}/api/health`);
}

bootstrap();
