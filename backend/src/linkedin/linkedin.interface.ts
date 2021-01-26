interface UserProfile {
    fullName: string;
    title: string;
    location: Location;
    photo: string;
    description: string;
    url: string;
}

interface Location {
    city: string;
    province: string;
    country: string;
}

interface Experience {
    title: string;
    company: string;
    employmentType: string;
    location: Location;
    startDate: string;
    endDate: string;
    endDateIsPresent: boolean;
    description: string;
    durationInDays: number;
}

interface Education {
    schoolName: string;
    degreeName: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    durationInDays: number;
}

interface Volunteering {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    endDateIsPresent: boolean;
    description: string;
    durationInDays: number;
}

interface Skill {
    skillName: string;
    endorsementCount: number;
}

export default interface LinkedinData {
    userProfile: UserProfile;
    experiences: Experience[];
    education: Education[];
    volunteerExperiences: Volunteering[];
    skills: Skill[];
}
