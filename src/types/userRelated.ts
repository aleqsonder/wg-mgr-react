

export interface UserContactResponse {
    contactType: string;
    content: string;
}

export interface UserResponse {
    id: number;
    username: string;
    contacts: Array<UserContactResponse>;
}


export interface UserContactRequest {
    contactType: string;
    content: string;
}

export interface UserRequest {
    username: string;
    contacts: Array<UserContactRequest>;
}
