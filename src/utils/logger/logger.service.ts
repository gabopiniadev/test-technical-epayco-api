import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLogger extends Logger {
  logInfo(message: string) {
    this.log(message);
  }

  logWarn(message: string) {
    this.warn(message);
  }

  logError(context: string, error: any) {
    const formattedError = error?.message || JSON.stringify(error);
    super.error(`[${context}] - ${formattedError}`, error?.stack || '');
  }

  logDebug(context: string, message: string) {
    this.debug(`[${context}] - ${message}`);
  }
}
