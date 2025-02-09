import { IsNotEmpty, IsString, Matches, IsEmail, MinLength } from 'class-validator';

export class RegisterDataDto {
    @IsString()
    @IsNotEmpty({ message: 'El tipo de documento es obligatorio.' })
    typeDocument: string;

    @IsString()
    @IsNotEmpty({ message: 'El documento es obligatorio.' })
    document: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre del cliente es obligatorio.' })
    nameCustomer: string;

    @IsString()
    @Matches(/^[0-9]+$/, { message: 'El teléfono debe contener solo números.' })
    phone: string;

    @IsEmail({}, { message: 'El email debe ser válido.' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    password: string;
}
