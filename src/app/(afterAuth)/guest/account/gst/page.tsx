import { redirect } from 'next/navigation';

type Props = {
    searchParams: { [key: string]: string | string[] | undefined };
};

export default function Page({ searchParams }: Props) {
    const urlParams = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
        if (value !== undefined) {
            if (Array.isArray(value)) {
                value.forEach(val => urlParams.append(key, val));
            } else {
                urlParams.append(key, value);
            }
        }
    }
    const queryString = urlParams.toString();
    redirect(`/account/gst${queryString ? `?${queryString}` : ''}`);
}