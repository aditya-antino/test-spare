'use client';

import React, { useState, useCallback } from 'react';
import HelpCategory from '@/components/articles/HelpCategory';

export default function ArticleCategoryClient({ section, initialArticles, sections }: any) {
    const [searchTerm, setSearchTerm] = useState('');

    const getSectionArticles = useCallback(
        function (sec: string | null) {
            if (!sec) return null;
            return initialArticles;
        },
        [initialArticles],
    );

    const searchArticles = useCallback(
        function (articles: any[]) {
            if (!searchTerm.trim()) return articles;

            const query = searchTerm.toLowerCase();
            return articles.filter(function (article) {
                return (
                    article.title.toLowerCase().includes(query) ||
                    article.category.toLowerCase().includes(query)
                );
            });
        },
        [searchTerm],
    );

    return (
        <HelpCategory
            activeSection={section}
            sections={sections}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            getSectionArticles={getSectionArticles}
            searchArticles={searchArticles}
        />
    );
}
