import { IsString } from 'class-validator';

class CreateCampaignDto {
    @IsString()
    public content: string;

    @IsString()
    public title: string;
}

export default CreateCampaignDto;