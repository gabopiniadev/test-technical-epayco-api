import { IsNotEmpty, IsPositive, IsString, Matches } from 'class-validator';

export class PaymentDto {
    @IsString()
    @IsNotEmpty({ message: 'El documento es obligatorio.' })
    document: string;

    @IsString()
    @Matches(/^[0-9]+$/, { message: 'El teléfono debe contener solo números.' })
    phone: string;

    @IsPositive({ message: 'El monto debe ser mayor a 0.' })
    amount: number;

    @IsString()
    @IsNotEmpty({ message: 'El tipo de transacción es obligatorio.' })
    type: string;
}
