import { Module } from '@nestjs/common';
import {WalletController} from "../../controlllers/wallet/wallet.controller";
import {WalletService} from "../../services/wallet/wallet.service";
import {HttpModule} from "@nestjs/axios";
import {EmailService} from "../../utils/email/email.service";
import { AppLogger } from '../../utils/logger/logger.service';

@Module({
    imports: [
        HttpModule
    ],
    controllers: [
        WalletController
    ],
    providers: [
        WalletService,
        EmailService,
        AppLogger
    ],
    exports: [
       WalletService,
        EmailService,
        AppLogger
    ]
})
export class WalletModule {}
