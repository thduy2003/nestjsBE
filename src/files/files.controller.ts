import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
@ApiTags("files")
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }
  @Public()
  @Post('upload')
  @ResponseMessage("Upload file successfully")
  @UseInterceptors(FileInterceptor('fileUpload'))
  uploadFile(@UploadedFile(new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /^(jpg|jpeg|png|image\/png|image\/jpeg|gif|txt|pdf|application\/pdf|doc|docx|text\/plain)$/i,
  })
  .addMaxSizeValidator({
    maxSize: 1000 * 1000
  })
  .build({
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
  }),) file: Express.Multer.File) {
    return {
      fileName: file.filename
    }
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
