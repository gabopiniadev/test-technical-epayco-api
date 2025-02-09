import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  @IsNotEmpty({ message: 'El sessionId es obligatorio.' })
  sessionId: string;

  @IsString()
  @IsNotEmpty({ message: 'El código de confirmación es obligatorio.' })
  confirmationCode: string;
}
