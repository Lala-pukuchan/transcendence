import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true });  //corsは，これで解決される
	const config = new DocumentBuilder()
		.setTitle('Transcendence')
		.setDescription('Transcendence API description')
		.setVersion('1.0')
		.build();

	// SwaggerModuleを使ってAPIドキュメントを生成
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);
	await app.listen(3000);
}
bootstrap();

