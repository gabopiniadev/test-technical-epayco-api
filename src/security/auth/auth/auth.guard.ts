import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) return false;

    try {
      request.user = this.jwtService.verify(token, {secret: '40a07a7470b5fb1d77fdb6a9b3f428d59c57a13949b24af88b2d825ffa2f10e69b7da1d9827ea6f1b5f2c17a3731cfb6a22033a943562a1a95969784d44729f6adc74c41d4e3dab39f26f9195ad0679121465aa552d58c06044e1d508913cc94e91f6d5d076ce19524658ad3250c0c06a2b8eea81b307a87676f7e529926a5a807bd2ec203d94432722fa1f64d45cc685ded9590f62f29a1abecc2a6ec04b220933fec2ce6898aeb65738e46109fb5b0ecf6603cf35343e4ded7fe852fb3bfa04faf644d5fd78906c3dae09c0f8baef98536e1d8986e122736123c1c809981bf50fdb6ec8f6b680e44de2d10cfea8ded870479b47f572df90456cc7b8a26b6e7'});
      return true;
    } catch (error) {
      return false;
    }
  }
}
