export type Listing = {
    id: string;
    title: string;
    subtitle?: string;
    image?: string;
};

export const listings: Listing[] = [
    { id: 'l1', title: 'Luxury 3 Bedroom Apartment | Anandram Homes' },
    { id: 'l2', title: 'Beach Villa | Anandram Homes' },
    { id: 'l3', title: 'Mountain Retreat | Anandram Homes' },
    { id: 'l4', title: 'City Penthouse | Anandram Homes' },
    { id: 'l5', title: 'Cozy Cottage | Anandram Homes' },
];
