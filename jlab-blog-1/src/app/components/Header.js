import Image from 'next/image';

export default function Header() {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center">
                    <Image
                        src="/logo.svg"
                        alt="JLab Logo"
                        width={10}
                        height={10}
                        priority
                        className="w-auto h-16"
                    />
                </div>
                <div className="text-lg text-gray-600">
                    By <span className="font-medium">ecodexm</span>
                </div>
            </div>
        </header>
    );
} 