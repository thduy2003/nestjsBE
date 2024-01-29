import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { Public } from 'src/decorator/customize';



@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: MongooseHealthIndicator,
    ) {}

    @Get()
    @Public()
    healthCheck() {
        return this.health.check([() => this.db.pingCheck('database')]);
    }
}