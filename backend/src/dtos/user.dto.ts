import { IsOptional, IsString, ValidateNested } from 'class-validator';

class CreateUserDto {
    @IsString()
    public firstName: string;

    @IsString()
    public lastName: string;

    @IsString()
    public email: string;

    @IsString()
    public password: string;

    @IsOptional()
    // @ValidateNested()
    public address?: string;
}

export default CreateUserDto;
