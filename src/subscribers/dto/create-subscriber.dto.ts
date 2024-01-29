import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
    @IsNotEmpty({ message: 'Field name cannot be empty' })
    @IsString({ message: 'Field name must be string' })
    name: string;

    @IsEmail({}, { message: 'Field email must be type email' })
    @IsNotEmpty({ message: 'Field email cannot be empty' })
    email: string;

    @IsArray({ message: 'Field skills must be array' })
    @ArrayNotEmpty({ message: 'Field skills cannot be array empty' })
    @IsString({ each: true, message: 'item of array skills must be string' })
    skills: string[];
}
