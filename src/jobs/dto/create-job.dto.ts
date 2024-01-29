
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsDateString, IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';
class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  logo: string;
}
export class CreateJobDto {

  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Salary không được để trống' })
  salary: number;

  @IsNotEmpty({ message: 'Skill không được để trống' })
  @IsArray()
  // "each" tells class-validator to run the validation on each item of the array
  @IsString({ each: true, message: 'Skill phải là string' })
  skills: string[];

  @IsNotEmpty({ message: 'Quantity không được để trống' })
  quantity: number;

  @IsNotEmpty({ message: 'Location không được để trống' })
  location: string;

  @IsNotEmpty({ message: 'Level không được để trống' })
  level: string;

  @IsNotEmpty({ message: 'Description không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'startDate không được để trống' })
  @IsDateString({message: 'startDate phải đúng định dạng'})
  startDate: Date;

  @IsNotEmpty({ message: 'endDate không được để trống' })
  @IsDateString({message: 'endDate phải đúng định dạng'})
  endDate: Date;
  
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}
