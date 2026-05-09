
import { Space } from './spaces.types';
import { User } from './user.types';

export interface ReviewData {
    id: number;
    rating: number;
    comments: string;
    flagged: boolean;
    created_at: string;
    updated_at: string;
    Space: Space;
    User: User;
}

export interface ReviewResponse {
    success: boolean;
    type: string;
    message: string;
    data: ReviewData;
}

export interface AddRatingPayload {
    bookingId: number;
    rating: number;
}

export interface AddCommentPayload {
    bookingId: number;
    comments: string;
}
