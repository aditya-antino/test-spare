import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HelpArticle {
    id: string;
    slug?: string;
    category: string;
    title: string;
    content: string;
    updated_at?: string;
}

interface HelpArticleProps {
    article: HelpArticle | null;
    section?: string;
    onBackToCategory?: () => void;
}

export default function HelpArticle({
    article,
    section = 'guests',
    onBackToCategory,
}: HelpArticleProps) {
    return (
        <div className=" bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href={`/articles/${section}`}>
                    <Button
                        variant="link"
                        className="text-sm mb-6 hover:underline flex items-center gap-2 text-gray-500 p-0"
                    >
                        ← Back to articles
                    </Button>
                </Link>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">{article.title}</h1>
                    {article.updated_at && (
                        <p className="text-sm text-gray-500 mb-6">
                            Last updated on{' '}
                            {new Date(article.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    )}
                </div>

                {/* 
                <div className="prose max-w-none">{parseContent(article.content)}</div> 
                */}
                <div
                    className="prose max-w-none prose-yellow [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-4 [&_li]:mb-2 [&_p]:mb-4"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </div>
        </div>
    );
}
