import { Module } from '@nestjs/common';
import {AuthModule} from "./security/auth/modules/auth.module";
import { WalletModule } from './modules/wallet/wallet.module';
import { EmailService } from './utils/email/email.service';
import { WalletController } from './controlllers/wallet/wallet.controller';
import { AppLogger } from './utils/logger/logger.service';


@Module({
  imports: [
      AuthModule,
      WalletModule
  ],
  providers: [
    EmailService,
    AppLogger,
  ],
  controllers: [
    WalletController
  ],
})
export class AppModule {}
