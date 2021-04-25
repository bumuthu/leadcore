import LinkedinData from './linkedin.interface'

interface RelevancyScore {
    keyword: string;
    score: number;
}

interface Analysis {
    cold: {
        activeScore: number;
        relevancyScore: RelevancyScore[];
        commonThings: any
    },
    hot: {
        engagingScore: number;
    }   
}

export default interface Customer {
    linkedinData: LinkedinData;
    profileUrl: string;
    email: string;
    worth: number;
    media: string,
    conversation: any[];
    pipelineStatus: string;
    events: any[];
    analysis: Analysis;
}
