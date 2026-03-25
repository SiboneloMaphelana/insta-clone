export interface Post {
  id: number;
  userId: number;
  caption: string;
  imageUrl: string;
  likes: number;
  timestamp: string;
  comments: number[];
  likedBy: number[];
}
