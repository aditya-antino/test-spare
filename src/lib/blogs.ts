import { GraphQLClient, gql } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
export const graphQLClient = new GraphQLClient(endpoint);

export const GET_ALL_BLOGS = gql`
    query AllBlogs {
        posts(where: { categoryName: "blogs" }) {
            nodes {
                id
                slug
                title
                excerpt
                featuredImage {
                    node {
                        sourceUrl
                    }
                }
                date
            }
        }
    }
`;

export const GET_ALL_ARTICLES = gql`
    query AllArticles {
        posts(where: { categoryName: "articles" }) {
            nodes {
                id
                slug
                title
                excerpt
                featuredImage {
                    node {
                        sourceUrl
                    }
                }
                date
            }
        }
    }
`;

// ✅ Fetch Single Post (works for both blogs & articles)
export const GET_SINGLE_POST = gql`
    query PostBySlug($slug: ID!) {
        post(id: $slug, idType: SLUG) {
            title
            content
            date
            featuredImage {
                node {
                    sourceUrl
                }
            }
            author {
                node {
                    name
                    avatar {
                        url
                    }
                }
            }
        }
    }
`;
