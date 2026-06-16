import { Module } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:HH:MM:ss.l',

                  ignore:
                    'pid,hostname,req.headers,res.headers,req.remoteAddress,req.remotePort',
                },
              }
            : undefined,

        wrapSerializers: false,

        serializers: {
          req(req: Request) {
            return {
              id: req.id,
              method: req.method,
              url: req.url,
              params: req.params,
              query: req.query,
            };
          },

          res(res: Response) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.accessToken',
            'req.body.refreshToken',
          ],
          remove: true,
        },
      },
    }),
  ],
})
export class LoggerModule {}
