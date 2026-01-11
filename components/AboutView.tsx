import React from 'react';
import { ArrowLeft, MessageCircle, Youtube, Users, ExternalLink, ShieldCheck } from 'lucide-react';

interface AboutViewProps {
    onBack: () => void;
}

const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold text-white">About SlenderHub</h1>
            </div>

            {/* Main Content Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-10 space-y-8 shadow-xl relative overflow-hidden">

                {/* Logo & Intro */}
                <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
                        <img
                            src="/slender-logo.png"
                            alt="SlenderHub Logo"
                            className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-2xl"
                        />
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-20 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                {/* Intro Section */}
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3 text-indigo-400 mb-2">
                        <ShieldCheck size={32} />
                        <h2 className="text-xl font-bold uppercase tracking-wider">Our Mission</h2>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-lg">
                        <span className="text-white font-semibold">SlenderHub</span> is a platform specialized in creating and distributing Roblox scripts, focused on offering high-quality tools for players seeking more performance, automation, and new possibilities within games.
                    </p>
                </div>

                {/* Community Stats/Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-colors">
                        <Youtube className="text-red-500 mb-4 h-8 w-8" />
                        <h3 className="text-lg font-bold text-white mb-2">YouTube Channel</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            More than <span className="text-white font-bold">1,000 subscribers</span> and thousands of views. Tutorials, showcases, and constant updates.
                        </p>
                        <a href="https://youtube.com/@slender-w1d?si=BhCJJulovpiqwGaL" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
                            Subscribe <ExternalLink size={14} />
                        </a>
                    </div>

                    <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-colors">
                        <Users className="text-blue-500 mb-4 h-8 w-8" />
                        <h3 className="text-lg font-bold text-white mb-2">Active Community</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Successful on TikTok with over <span className="text-white font-bold">10,000+ views</span> per post and a growing Discord community.
                        </p>
                        <a href="https://discord.gg/JYeMPRWT" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
                            Join Us <ExternalLink size={14} />
                        </a>
                    </div>
                </div>

                {/* Commitment Text */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <p className="text-slate-300 leading-relaxed">
                        Our team works continuously on developing scripts and exploits for various Roblox games, always seeking stability, efficiency, and compatibility with the main executors on the market.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                        SlenderHub was born with a clear goal: <span className="text-white font-medium">to offer powerful, updated, and reliable tools</span> for the Roblox community, helping players and creators explore the full potential of games.
                    </p>
                </div>

                {/* Future Note */}
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-6 text-center">
                    <p className="text-indigo-200 font-medium flex items-center justify-center gap-2 text-lg">
                        🚀 We are just getting started — and the future of SlenderHub is to grow together with our community.
                    </p>
                </div>

                {/* Partner Section */}
                <div className="text-center pt-8">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Official Partners</h3>
                    <div className="flex justify-center">
                        <a href="https://rocheats.com?ref=slenderscripts" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-all">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 group-hover:border-indigo-500 transition-colors overflow-hidden p-2">
                                <img
                                    src="/rocheats-logo.png"
                                    alt="RoCheats"
                                    className="w-full h-full object-contain drop-shadow-md"
                                />
                            </div>
                            <span className="text-white font-bold tracking-wide group-hover:text-indigo-400 transition-colors">RoCheats</span>
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AboutView;
