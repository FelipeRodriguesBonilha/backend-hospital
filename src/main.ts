import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  });


  const config = new DocumentBuilder()
    .setTitle('Documentação API SICH')
    .setDescription('Documentação oficial da aplicação de Sistema Integrado para Clinícas e Hospitais para TCC de Ciência da Computação na FEMA')
    .setVersion('1.0')
    .addTag('cats')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Insira seu token JWT sem prefixo'
      },
      'JWT-auth'
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
