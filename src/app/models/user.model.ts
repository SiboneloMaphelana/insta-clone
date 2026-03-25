export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  profileImage: string;
  bio: string;
  following: number[];
  followers: number[];
  password: string;
}
