import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true });  //corsは，これで解決される
	const config = new DocumentBuilder()
		.setTitle('Transcendence')
		.setDescription('Transcendence API description')
		.setVersion('1.0')
		.build();

	// セッションの設定
	app.use(session({
		// cookieの保持時間（一日）
		cookie: {
			maxAge: 86400000,
		},
		secret: 'jfido:asjf;nsuhfdjjf',
		resave: false,
		saveUninitialized: false
	}))

	// パスポートの初期化
	app.use(passport.initialize());
	app.use(passport.session());

	// SwaggerModuleを使ってAPIドキュメントを生成
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);
	await app.listen(3000);
}
bootstrap();

