const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');

let cachedApp;

async function getApp() {
  if (cachedApp) return cachedApp;

  const { AppModule } = require('../dist/app.module');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin || requestOrigin.startsWith('http://localhost')) {
        callback(null, true);
      } else if (requestOrigin.includes('veterinaria-hermes-pos-monorepo-front')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Veterinaria Hermes POS API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.init();
  cachedApp = app;
  return cachedApp;
}

module.exports = async (req, res) => {
  try {
    const app = await getApp();
    const instance = app.getHttpAdapter().getInstance();
    instance(req, res);
  } catch (error) {
    console.error('Vercel handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ statusCode: 500, message: 'Internal Server Error' }));
  }
};
