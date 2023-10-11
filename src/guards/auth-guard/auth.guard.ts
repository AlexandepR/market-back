import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY, REFRESH_TOKEN_AUTH_KEY } from '../../utils/public.decorator';
import { settingsEnv } from '../../settings/settings';
import { UsersRepository } from "../../modules/users/infrastructure/users.repository";


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private usersRepository: UsersRepository,

    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const request = context.switchToHttp().getRequest();

        if (isPublic) {
            return true;
        }
        const isRefreshToken = this.reflector.getAllAndOverride<boolean>(
            REFRESH_TOKEN_AUTH_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ],
        );
        if (isRefreshToken) {
            const user = await this.extractUserFromRefreshToken(request);
            if (!user) {
                throw new UnauthorizedException();
            }
            return true;
        }

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: settingsEnv.JWT_SECRET,
            });
            const user = await this.usersRepository.findUserById(payload.userId);
            request.requestUser = user;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    private async extractUserFromRefreshToken(request: Request): Promise<boolean> {
        const refreshToken = request.cookies.refreshToken;
        if (!refreshToken) return false;
        try {
            const getRefreshToken: any = jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET, undefined)
            const user = await this.usersRepository.findUserById(getRefreshToken.userId);
            for (const token of user.expRefreshToken) {
                if (token === refreshToken) return false;
            }
            request.requestUser = user;
            return true;
        } catch (err) {
            throw new UnauthorizedException();
        }
    }
}