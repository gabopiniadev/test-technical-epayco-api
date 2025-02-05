import { Module } from '@nestjs/common';
import {AuthModule} from "./security/auth/modules/auth.module";
import { WalletModule } from './modules/wallet/wallet.module';
import { EmailService } from './utils/email/email.service';

@Module({
  imports: [
      AuthModule,
      WalletModule
  ],
  providers: [

  EmailService],
  controllers: [

    ],
})
export class AppModule {}
