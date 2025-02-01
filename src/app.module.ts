import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserControllerController } from './controlllers/user-controller/user-controller.controller';
import { AuthController } from './controlllers/auth/auth.controller';

@Module({
  imports: [],
  controllers: [AppController, UserControllerController, AuthController],
  providers: [AppService],
})
export class AppModule {}
