import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: 'http://localhost:8080', credentials: true },
  });
  const config = new DocumentBuilder()
    .setTitle('UNO')
    .setDescription('The UNO API description')
    .setVersion('1.0')
    .addTag('UNO')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
