import React from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import HelpIcon from './HelpIcon';

interface HelpArticle {
    id: string;
    slug?: string;
    category: string;
    title: string;
    content: string;
}

interface HelpCategory {
    title: string;
    icon: string;
    description: string;
    articles?: HelpArticle[];
}

interface HelpCategoryProps {
    activeSection: string | null;
    sections: Record<string, HelpCategory>;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onBackToHome?: () => void;
    onArticleSelect?: (article: HelpArticle) => void;
    getSectionArticles: (section: string | null) => HelpArticle[] | null;
    searchArticles: (articles: HelpArticle[]) => HelpArticle[];
}

export default function HelpCategory({
    activeSection,
    sections,
    searchTerm,
    onSearchChange,
    onBackToHome,
    onArticleSelect,
    getSectionArticles,
    searchArticles,
}: HelpCategoryProps) {
    if (!activeSection) return null;

    const sectionInfo = sections[activeSection];
    const articles = getSectionArticles(activeSection);

    if (!articles) {
        return (
            <div className="bg-white min-h-[60vh]">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <Link href="/articles">
                        <Button
                            variant="link"
                            className="text-sm mb-6 hover:underline flex items-center gap-2 text-gray-500"
                        >
                            ← Go Back
                        </Button>
                    </Link>
                    <div className="flex flex-col items-center justify-center py-20 text-center mt-10">
                        <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center mb-6">
                            <HelpIcon
                                name={sectionInfo.icon}
                                size={40}
                                className="text-yellow-400"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            No articles available
                        </h2>
                        <p className="text-gray-500 text-lg">
                            We couldn't find any articles related to{' '}
                            {sectionInfo.title.toLowerCase()} at the moment.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const filteredArticles = searchArticles(articles);

    const groupedArticles = filteredArticles.reduce(function (
        acc: Record<string, HelpArticle[]>,
        article,
    ) {
        if (!acc[article.category]) {
            acc[article.category] = [];
        }
        acc[article.category].push(article);
        return acc;
    }, {});

    function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        onSearchChange(event.target.value);
    }

    function handleArticleClick(article: HelpArticle) {
        onArticleSelect(article);
    }

    function renderCategoryArticles([category, categoryArticles]: [string, HelpArticle[]]) {
        return (
            <div key={category} className="mb-10">
                <h2 className="text-xl font-bold mb-4 pb-2 text-gray-900 border-b-2 border-yellow-200">
                    {category}
                </h2>
                <div className="space-y-3">{categoryArticles.map(renderArticleButton)}</div>
            </div>
        );
    }

    function renderArticleButton(article: HelpArticle) {
        return (
            <Link
                key={article.id}
                href={`/articles/${activeSection}/${article.slug}`}
                className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 bg-white border border-yellow-200 group hover:bg-gray-50"
            >
                <div className="flex-1 flex justify-between items-center w-full">
                    <span className="text-left font-medium text-gray-900">{article.title}</span>
                    <ChevronRight size={20} className="text-gray-500 flex-shrink-0" />
                </div>
            </Link>
        );
    }

    return (
        <div className="bg-white">
            <div className="bg-gradient-to-br from-[#FEFAEE] via-white to-[#FDF8E4] py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search for articles..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full py-4 pl-12 pr-4 rounded-lg text-lg bg-white text-black placeholder-gray-400 border border-yellow-400 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <Link href="/articles">
                    <Button
                        variant="link"
                        className="text-sm mb-6 hover:underline flex items-center gap-2 text-gray-500"
                    >
                        ← Go Back
                    </Button>
                </Link>

                <div className="flex items-start gap-4 mb-8">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-yellow-100">
                        <HelpIcon name={sectionInfo.icon} size={32} className="text-yellow-600" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-gray-900">
                            {sectionInfo.title}
                        </h1>
                        <p className="text-gray-600">{sectionInfo.description}</p>
                        <p className="text-sm mt-2 text-gray-500">
                            {filteredArticles.length} articles
                        </p>
                    </div>
                </div>

                {Object.entries(groupedArticles).map(renderCategoryArticles)}

                {filteredArticles.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-500">
                            No articles found matching "{searchTerm}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
