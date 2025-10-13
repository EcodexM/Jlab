'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetchedPosts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                }));
                setPosts(fetchedPosts);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-center text-gray-900 text-lg font-medium">Loading posts...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
            {posts.length === 0 ? (
                <p className="text-center text-gray-900 text-lg font-medium">No blog posts yet.</p>
            ) : (
                <div className="w-full space-y-8">
                    {posts.map((post) => (
                        <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.01] hover:shadow-lg">
                            <div className="p-6 flex flex-col items-center">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">
                                    <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </Link>
                                </h2>
                                <div
                                    className="prose prose-lg max-w-none text-gray-800 mb-4 text-center"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                                <p className="text-sm text-gray-700 text-center">
                                    {post.createdAt?.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <div className="mt-4 flex justify-start">
                                    <Link href={`/blog/${post.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                                        Read more
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
} 