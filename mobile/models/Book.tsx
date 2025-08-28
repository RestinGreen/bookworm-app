export type Book = {
    _id: string;
    title: string;
    caption: string;
    rating: number;
    createdAt: string;
    user: {
        profileImage: string;
        username: string;
    };
    image: string;
};