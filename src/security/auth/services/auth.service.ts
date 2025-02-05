import {
    ConflictException,
    HttpException, HttpStatus,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import RegisterData from "../../../dto/customer.interface";
import {firstValueFrom} from "rxjs";
import {HttpService} from "@nestjs/axios";

interface User {
    typeDocument: string;
    document: string;
    nameCustomer: string;
    phone: string;
    email: string;
    password: string;
}

@Injectable()
export class AuthService {

    private users: User[] = [];

    constructor(
        private readonly jwtService: JwtService,
        private readonly httpService: HttpService
    ) {}

    async register(data: RegisterData) {
        const { typeDocument, document, nameCustomer, phone, email, password } = data;

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const customerData = { typeDocument, document, nameCustomer, email, phone };
            const customerResponse = await firstValueFrom(
                this.httpService.post('http://localhost:4000/api/db/customer', customerData)
            );
            const { _id: customerId } = customerResponse.data;

            if (!customerId) {
                throw new Error('No se pudo obtener el ID del cliente.');
            }

            const userData = { customerId, email, password: hashedPassword };
            console.log(userData);
            await firstValueFrom(
                this.httpService.post('http://localhost:4000/api/db/user', userData)
            );

            const walletData = { customerId, balance: 0, currency: 'USD' };
            await firstValueFrom(
                this.httpService.post('http://localhost:4000/api/db/wallet', walletData)
            );

            return { message: 'Cliente, usuario y billetera registrados correctamente.' };
        } catch (error) {
            console.error('Error al registrar cliente/usuario/billetera:', error.message);
            throw new InternalServerErrorException('Error al registrar cliente/usuario/billetera.');
        }
    }

    async login(email: string, password: string) {
        try {
            const dbApiUrl = 'http://localhost:4000/api/db/auth/login';

            const response = await this.httpService.post(dbApiUrl, { email, password }).toPromise();

            if (!response || !response.data || !response.data.user) {
                throw new HttpException(
                    'Respuesta no válida del servidor',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            const data = response.data;


            console.log("Data Customer ID = " + data.customer._id)

            const payload = {
                user: data.user.name,
                email: data.user.email,
                phone: data.customer.phone,
                customerId: data.customer.id,
                document: data.customer.document,
                sub: data.user.id
            };

            const token = this.jwtService.sign(payload);

            return {
                token,
                user: data.user,
            };
        } catch (error) {
            console.error("Error en el login del interceptor:", error);
            throw new HttpException(
                error.response?.data?.message || 'Error al autenticar usuario.',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getProfileInfo(
        document: string,
        phone: string,
    ): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get('http://localhost:4000/api/db/user/info', {
                    params: { document, phone },
                }),
            );

            console.log("Esto es response " + JSON.stringify(response.data));

            return response.data;
        } catch (error: any) {
            throw new HttpException(
                error.response?.data?.message ||
                'Hubo un error al consultar el saldo desde la API DB.',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

}
