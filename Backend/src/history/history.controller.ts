import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HistoryService } from './history.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('history')
@Controller('history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user’s answer history' })
  @ApiResponse({ status: 200, description: 'Returns list of user’s answers with questions and scores' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getHistory(@Req() req) {
    return this.historyService.getHistory(req.user.id);
  }
}