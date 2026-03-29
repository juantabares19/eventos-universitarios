export interface ResultNews {
    articles: Array<NewsData>;
    status: string;
    totalResults: number
}


export interface NewsData {
    author: string;
    title: string;
    description: string,
    url: string;
    urlToImage: string;
    publishedAt: string,
    content: string;
}