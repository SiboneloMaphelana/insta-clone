export interface User{
    id: string,
    name: string,
    email: string,
    username: string,
    profileImage: string,
    bio: string,
    following: string[],
    followers: string[],
    password: string
}