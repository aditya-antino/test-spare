import { BookingStatus } from '@/constants/booking-status';
import type { Reservation } from '@/types/reservations';

// Dummy properties data
const dummyProperties = [
    {
        id: 'p1',
        title: 'Brahma Estates',
        subtitle: 'Luxury residential complex',
        thumbnailUrl: '/images/property1.jpg',
    },
    {
        id: 'p2',
        title: 'Sunrise Conference Center',
        subtitle: 'Professional meeting spaces',
        thumbnailUrl: '/images/property2.jpg',
    },
    {
        id: 'p3',
        title: 'Mountain View Hotel',
        subtitle: 'Scenic mountain retreat',
        thumbnailUrl: '/images/property3.jpg',
    },
    {
        id: 'p4',
        title: 'Tech Park Plaza',
        subtitle: 'Modern tech workspace',
        thumbnailUrl: '/images/property4.jpg',
    },
    {
        id: 'p5',
        title: 'Business Center',
        subtitle: 'Corporate meeting facilities',
        thumbnailUrl: '/images/property5.jpg',
    },
    {
        id: 'p6',
        title: 'Corporate Tower',
        subtitle: 'Premium office spaces',
        thumbnailUrl: '/images/property6.jpg',
    },
    {
        id: 'p7',
        title: 'Convention Center',
        subtitle: 'Large event venues',
        thumbnailUrl: '/images/property7.jpg',
    },
    {
        id: 'p8',
        title: 'Office Complex',
        subtitle: 'Professional workspace',
        thumbnailUrl: '/images/property8.jpg',
    },
];

// Dummy spaces data
const dummySpaces = [
    {
        id: 's1',
        propertyId: 'p1',
        name: 'XYZ Innovation Hub',
        thumbnailUrl: '/images/space1.jpg',
    },
    {
        id: 's2',
        propertyId: 'p2',
        name: 'Beta Solutions Lab',
        thumbnailUrl: '/images/space2.jpg',
    },
    {
        id: 's3',
        propertyId: 'p3',
        name: 'Alpha Tech Hub',
        thumbnailUrl: '/images/space3.jpg',
    },
    {
        id: 's4',
        propertyId: 'p4',
        name: 'Innovation Studio',
        thumbnailUrl: '/images/space4.jpg',
    },
    {
        id: 's5',
        propertyId: 'p5',
        name: 'Executive Lounge',
        thumbnailUrl: '/images/space5.jpg',
    },
    {
        id: 's6',
        propertyId: 'p6',
        name: 'Creative Space',
        thumbnailUrl: '/images/space6.jpg',
    },
    {
        id: 's7',
        propertyId: 'p7',
        name: 'Grand Hall',
        thumbnailUrl: '/images/space7.jpg',
    },
    {
        id: 's8',
        propertyId: 'p8',
        name: 'Collaboration Hub',
        thumbnailUrl: '/images/space8.jpg',
    },
];

// Dummy reservations data
export const dummyReservations: Reservation[] = [
    {
        id: '1',
        guest: {
            id: 'g1',
            name: 'Sonam Anil Kotak',
            email: 'sonam.kotak@email.com',
            phone: '+91 98765 43210',
            attendees: 6,
        },
        property: dummyProperties[0],
        space: dummySpaces[0],
        activityCategory: 'Executive Suite',
        dateTime: {
            startDate: '2025-08-21',
            endDate: '2025-08-21',
            startTime: '4:03PM',
            endTime: '12:00PM',
        },
        bookedOn: {
            date: '2025-08-21',
            time: '4:03PM',
        },
        totalPayout: {
            amount: 18200,
            currency: 'USD',
            formatted: '$18,200',
        },
        status: 'upcoming',
        paymentStatus: 'paid',
        createdAt: '2025-08-21T16:03:00Z',
        updatedAt: '2025-08-21T16:03:00Z',
    },
    {
        id: '2',
        guest: {
            id: 'g2',
            name: 'Aditi Raj Mehta',
            email: 'aditi.mehta@email.com',
            phone: '+91 98765 43211',
            attendees: 8,
        },
        property: dummyProperties[1],
        space: dummySpaces[1],
        activityCategory: 'Main Hall',
        dateTime: {
            startDate: '2025-08-22',
            endDate: '2025-08-22',
            startTime: '10:00AM',
            endTime: '5:00PM',
        },
        bookedOn: {
            date: '2025-08-22',
            time: '10:00AM',
        },
        totalPayout: {
            amount: 24500,
            currency: 'USD',
            formatted: '$24,500',
        },
        status: 'upcoming',
        paymentStatus: 'paid',
        createdAt: '2025-08-22T10:00:00Z',
        updatedAt: '2025-08-22T10:00:00Z',
    },
    {
        id: '3',
        guest: {
            id: 'g3',
            name: 'Ravi Kumar Sharma',
            email: 'ravi.sharma@email.com',
            phone: '+91 98765 43212',
            attendees: 10,
        },
        property: dummyProperties[2],
        space: dummySpaces[2],
        activityCategory: 'Conference Room A',
        dateTime: {
            startDate: '2025-08-23',
            endDate: '2025-08-23',
            startTime: '9:30AM',
            endTime: '3:30PM',
        },
        bookedOn: {
            date: '2025-08-23',
            time: '9:30AM',
        },
        totalPayout: {
            amount: 30750,
            currency: 'USD',
            formatted: '$30,750',
        },
        status: 'upcoming',
        paymentStatus: 'paid',
        createdAt: '2025-08-23T09:30:00Z',
        updatedAt: '2025-08-23T09:30:00Z',
    },
    {
        id: '4',
        guest: {
            id: 'g4',
            name: 'Priya Singh',
            email: 'priya.singh@email.com',
            phone: '+91 98765 43213',
            attendees: 4,
        },
        property: dummyProperties[3],
        space: dummySpaces[3],
        activityCategory: 'Meeting Room',
        dateTime: {
            startDate: '2025-08-24',
            endDate: '2025-08-24',
            startTime: '2:00PM',
            endTime: '6:00PM',
        },
        bookedOn: {
            date: '2025-08-24',
            time: '2:00PM',
        },
        totalPayout: {
            amount: 12800,
            currency: 'USD',
            formatted: '$12,800',
        },
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: '2025-08-24T14:00:00Z',
        updatedAt: '2025-08-24T18:00:00Z',
    },
    {
        id: '5',
        guest: {
            id: 'g5',
            name: 'Amit Patel',
            email: 'amit.patel@email.com',
            phone: '+91 98765 43214',
            attendees: 12,
        },
        property: dummyProperties[4],
        space: dummySpaces[4],
        activityCategory: 'Board Room',
        dateTime: {
            startDate: '2025-08-25',
            endDate: '2025-08-25',
            startTime: '11:00AM',
            endTime: '4:00PM',
        },
        bookedOn: {
            date: '2025-08-25',
            time: '11:00AM',
        },
        totalPayout: {
            amount: 28900,
            currency: 'USD',
            formatted: '$28,900',
        },
        status: 'cancelled',
        paymentStatus: 'refunded',
        createdAt: '2025-08-25T11:00:00Z',
        updatedAt: '2025-08-25T11:00:00Z',
    },
    {
        id: '6',
        guest: {
            id: 'g6',
            name: 'Neha Gupta',
            email: 'neha.gupta@email.com',
            phone: '+91 98765 43215',
            attendees: 6,
        },
        property: dummyProperties[5],
        space: dummySpaces[5],
        activityCategory: 'Workshop Area',
        dateTime: {
            startDate: '2025-08-26',
            endDate: '2025-08-26',
            startTime: '9:00AM',
            endTime: '2:00PM',
        },
        bookedOn: {
            date: '2025-08-26',
            time: '9:00AM',
        },
        totalPayout: {
            amount: 15600,
            currency: 'USD',
            formatted: '$15,600',
        },
        status: 'rejected',
        paymentStatus: 'pending',
        createdAt: '2025-08-26T09:00:00Z',
        updatedAt: '2025-08-26T09:00:00Z',
    },
    {
        id: '7',
        guest: {
            id: 'g7',
            name: 'Vikram Malhotra',
            email: 'vikram.malhotra@email.com',
            phone: '+91 98765 43216',
            attendees: 15,
        },
        property: dummyProperties[6],
        space: dummySpaces[6],
        activityCategory: 'Auditorium',
        dateTime: {
            startDate: '2025-08-27',
            endDate: '2025-08-27',
            startTime: '6:00PM',
            endTime: '10:00PM',
        },
        bookedOn: {
            date: '2025-08-27',
            time: '6:00PM',
        },
        totalPayout: {
            amount: 45200,
            currency: 'USD',
            formatted: '$45,200',
        },
        status: 'upcoming',
        paymentStatus: 'paid',
        createdAt: '2025-08-27T18:00:00Z',
        updatedAt: '2025-08-27T18:00:00Z',
    },
    {
        id: '8',
        guest: {
            id: 'g8',
            name: 'Sneha Reddy',
            email: 'sneha.reddy@email.com',
            phone: '+91 98765 43217',
            attendees: 8,
        },
        property: dummyProperties[7],
        space: dummySpaces[7],
        activityCategory: 'Open Space',
        dateTime: {
            startDate: '2025-08-28',
            endDate: '2025-08-28',
            startTime: '1:00PM',
            endTime: '5:00PM',
        },
        bookedOn: {
            date: '2025-08-28',
            time: '1:00PM',
        },
        totalPayout: {
            amount: 19800,
            currency: 'USD',
            formatted: '$19,800',
        },
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: '2025-08-28T13:00:00Z',
        updatedAt: '2025-08-28T17:00:00Z',
    },
    {
        id: '9',
        guest: {
            id: 'g9',
            name: 'Rajesh Kumar',
            email: 'rajesh.kumar@email.com',
            phone: '+91 98765 43218',
            attendees: 5,
        },
        property: dummyProperties[0],
        space: dummySpaces[0],
        activityCategory: 'Executive Suite',
        dateTime: {
            startDate: '2025-08-29',
            endDate: '2025-08-29',
            startTime: '3:00PM',
            endTime: '7:00PM',
        },
        bookedOn: {
            date: '2025-08-29',
            time: '3:00PM',
        },
        totalPayout: {
            amount: 16500,
            currency: 'USD',
            formatted: '$16,500',
        },
        status: 'upcoming',
        paymentStatus: 'paid',
        createdAt: '2025-08-29T15:00:00Z',
        updatedAt: '2025-08-29T15:00:00Z',
    },
    {
        id: '10',
        guest: {
            id: 'g10',
            name: 'Anjali Desai',
            email: 'anjali.desai@email.com',
            phone: '+91 98765 43219',
            attendees: 7,
        },
        property: dummyProperties[1],
        space: dummySpaces[1],
        activityCategory: 'Main Hall',
        dateTime: {
            startDate: '2025-08-30',
            endDate: '2025-08-30',
            startTime: '10:30AM',
            endTime: '2:30PM',
        },
        bookedOn: {
            date: '2025-08-30',
            time: '10:30AM',
        },
        totalPayout: {
            amount: 22100,
            currency: 'USD',
            formatted: '$22,100',
        },
        status: 'upcoming',
        paymentStatus: 'paid',
        createdAt: '2025-08-30T10:30:00Z',
        updatedAt: '2025-08-30T10:30:00Z',
    },
];

// Helper function to get reservations by status
export const getReservationsByStatus = (status: string): Reservation[] => {
    if (status === 'upcoming') {
        return dummyReservations.filter((r) => r.status === 'upcoming');
    } else if (status === 'completed') {
        return dummyReservations.filter((r) => r.status === 'completed');
    } else if (status === 'cancelled') {
        return dummyReservations.filter((r) => r.status === 'cancelled');
    } else if (status === 'rejected') {
        return dummyReservations.filter((r) => r.status === 'rejected');
    }
    return dummyReservations;
};

// Helper function to get paginated reservations
export const getPaginatedReservations = (
    reservations: Reservation[],
    page: number = 1,
    limit: number = 10,
) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = reservations.slice(startIndex, endIndex);

    return {
        data: paginatedData,
        meta: {
            currentPage: page,
            totalPages: Math.ceil(reservations.length / limit),
            totalItems: reservations.length,
            itemsPerPage: limit,
            hasNextPage: page < Math.ceil(reservations.length / limit),
            hasPreviousPage: page > 1,
        },
    };
};
