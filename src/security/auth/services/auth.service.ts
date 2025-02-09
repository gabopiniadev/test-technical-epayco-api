import {
    Injectable,
    InternalServerErrorException,
    HttpException,
    HttpStatus,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import * as bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { RegisterDataDto } from '../../../dto/customer.interface';
import { API_ENDPOINTS } from '../../../config/endpoints';
import { AppLogger } from '../../../utils/logger/logger.service';


@Injectable()
export class AuthService {
    constructor(
      private readonly jwtService: JwtService,
      private readonly httpService: HttpService,
      private readonly logger: AppLogger,
    ) {}

    async register(data: RegisterDataDto) {
        const { typeDocument, document, nameCustomer, phone, email, password } = data;

        try {
            this.logger.logInfo('Iniciando registro de cliente, usuario y billetera...');

            const hashedPassword = await bcrypt.hash(password, 10);

            const customerData = { typeDocument, document, nameCustomer, email, phone };
            const customerResponse = await firstValueFrom(
              this.httpService.post(API_ENDPOINTS.CUSTOMER_REGISTER, customerData),
            );
            const { _id: customerId } = customerResponse.data;

            if (!customerId) {
                throw new Error('No se pudo obtener el ID del cliente');
            }

            const userData = { customerId, email, password: hashedPassword };
            await firstValueFrom(this.httpService.post(API_ENDPOINTS.USER_REGISTER, userData));

            const walletData = { customerId, balance: 0, currency: 'USD' };
            await firstValueFrom(this.httpService.post(API_ENDPOINTS.WALLET_CREATE, walletData));

            this.logger.logInfo('Cliente, usuario y billetera registrados correctamente.');
            return { message: 'Cliente, usuario y billetera registrados correctamente.' };
        } catch (error) {
            this.logger.logError('Error al registrar cliente/usuario/billetera', error);
            
            if (error.response?.status === HttpStatus.CONFLICT) {
                throw new ConflictException('El cliente ya existe en el sistema.');
            }

            throw new InternalServerErrorException(
              'Error al registrar cliente, usuario y billetera.',
            );
        }
    }

    async login(email: string, password: string) {
        try {
            this.logger.logInfo('Iniciando login de usuario...');

            const response = await firstValueFrom(
              this.httpService.post(API_ENDPOINTS.AUTH_LOGIN, { email, password }),
            );

            if (!response || !response.data || !response.data.user) {
                throw new HttpException(
                  'Credenciales incorrectas o respuesta no válida del servidor.',
                  HttpStatus.UNAUTHORIZED,
                );
            }

            const data = response.data;
            this.logger.logInfo(`Usuario autenticado: ${data.user.email}`);

            const payload = {
                user: data.customer.name,
                email: data.user.email,
                phone: data.customer.phone,
                customerId: data.customer.id,
                document: data.customer.document,
                sub: data.user.id,
            };

            const token = this.jwtService.sign(payload);

            return {
                token,
                user: data.user,
            };
        } catch (error) {
            this.logger.logError('Error durante el proceso de login', error);

            if (error.response?.status === HttpStatus.UNAUTHORIZED) {
                throw new UnauthorizedException('Credenciales incorrectas.');
            }

            throw new HttpException(
              error.response?.data?.message || 'Error al autenticar usuario.',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getProfileInfo(document: string, phone: string): Promise<any> {
        try {
            this.logger.logDebug('AuthService', `Consultando información para ${document} - ${phone}`);

            const response = await firstValueFrom(
              this.httpService.get(API_ENDPOINTS.USER_INFO, { params: { document, phone } }),
            );

            this.logger.logInfo('Información del perfil obtenida correctamente.');
            return response.data;
        } catch (error: any) {
            this.logger.logError('Error al obtener la información del perfil', error);

            throw new HttpException(
              error.response?.data?.message ||
              'Hubo un error al consultar el perfil desde la API DB.',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
