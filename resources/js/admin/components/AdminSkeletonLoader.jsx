import React from 'react';

const AdminSkeletonLoader = () => {
    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            {/* Sidebar Skeleton */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4 pt-4">
                    {/* Logo skeleton */}
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mb-8"></div>
                    
                    {/* Navigation items skeleton */}
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded animate-pulse mb-2"></div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Header skeleton */}
                <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Page Content skeleton */}
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Title */}
                    <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>

                    {/* Cards Grid - for dashboard or list pages */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
                                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                                <div className="h-2 w-16 bg-gray-100 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>

                    {/* Table/List skeleton */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Table header */}
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                            <div className="flex gap-4">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse flex-1"></div>
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>

                        {/* Table rows */}
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="border-b border-gray-200 px-6 py-4">
                                <div className="flex gap-4 items-center">
                                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                                    <div className="h-4 flex-1 bg-gray-100 rounded animate-pulse"></div>
                                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination skeleton */}
                    <div className="mt-6 flex justify-center gap-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSkeletonLoader;
