import React from 'react';
import { ArrowLeft, MessageCircle, Youtube, Users, ExternalLink, ShieldCheck } from 'lucide-react';

interface AboutViewProps {
    onBack: () => void;
}

const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
    return (
        <div className="animate-fade-in max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onBack}
                        className="p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Genesis_Protocol</h1>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1 block px-1">About the Nexus Platform</span>
                    </div>
                </div>
            </div>

            {/* Main Content Card - Premium Glass */}
            <div className="glass-premium border border-white/[0.05] rounded-[3rem] p-10 md:p-16 space-y-16 shadow-2xl relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-1000"></div>
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-rose-500/5 blur-[120px] rounded-full group-hover:bg-rose-500/10 transition-all duration-1000"></div>

                {/* Logo & Branding */}
                <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full animate-pulse-slow"></div>
                        <img
                            src="/slender-logo.png"
                            alt="SlenderHub Logo"
                            className="w-40 h-40 md:w-56 md:h-56 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter">SlenderHub</h2>
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-px w-12 bg-indigo-500/40"></div>
                            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em]">The Elite standard</span>
                            <div className="h-px w-12 bg-indigo-500/40"></div>
                        </div>
                    </div>
                </div>

                {/* Mission Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 items-center">
                    <div className="lg:col-span-1 flex flex-col items-center">
                        <div className="w-1.5 h-32 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
                    </div>
                    <div className="lg:col-span-11 space-y-6">
                        <div className="flex items-center gap-4">
                            <ShieldCheck size={32} strokeWidth={1.5} className="text-indigo-400" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">System Objective</h3>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-xl font-medium">
                            <span className="text-white font-black underline decoration-indigo-500/50 decoration-4 underline-offset-4">SlenderHub</span> is a platform specialized in creating and distributing ROBLOX scripts, focused on offering high-quality tools for players seeking more performance, automation, and new possibilities within games.
                        </p>
                    </div>
                </div>

                {/* Community Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/[0.05] hover:border-indigo-500/40 transition-all group/card shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <Youtube className="text-rose-500 mb-6 h-12 w-12 group-hover/card:scale-110 transition-transform duration-500" />
                            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Media Presence</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                More than <span className="text-white font-black">1,000 active subscribers</span> and thousands of monthly views. High-density tutorials, showcases, and live updates.
                            </p>
                            <a href="https://youtube.com/@slender-w1d?si=BhCJJulovpiqwGaL" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-white/5 border border-white/5 hover:border-rose-500/40 text-slate-300 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all rounded-2xl shadow-xl">
                                Subscribe to Nexus <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/[0.05] hover:border-blue-500/40 transition-all group/card shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <Users className="text-indigo-500 mb-6 h-12 w-12 group-hover/card:scale-110 transition-transform duration-500" />
                            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">User Mesh</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                Disruptive TikTok growth with over <span className="text-white font-black">10,000+ views</span> per update. A rapidly evolving Discord server for global networking.
                            </p>
                            <a href="https://discord.gg/JYeMPRWT" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-white/5 border border-white/5 hover:border-indigo-500/40 text-slate-300 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all rounded-2xl shadow-xl">
                                Join Protocol <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Legacy & Commitment */}
                <div className="space-y-8 pt-10 border-t border-white/[0.05] relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <p className="text-slate-400 leading-relaxed font-medium italic">
                            "Our team works continuously on developing scripts and exploits for various games, always seeking stability, efficiency, and compatibility with the main executors on the market."
                        </p>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            SlenderHub was born with a clear goal: <span className="text-white font-black text-lg">to offer powerful, updated, and reliable tools</span> for the community, helping players and creators explore the full potential of game engines.
                        </p>
                    </div>
                </div>

                {/* Final Branding */}
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] p-10 text-center relative overflow-hidden group/final">
                    <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-3xl"></div>
                    <p className="text-indigo-300 font-black flex items-center justify-center gap-4 text-xl uppercase tracking-widest relative z-10 group-hover/final:scale-105 transition-transform duration-700">
                        🚀 We are just getting started — Join the Evolution.
                    </p>
                </div>

                {/* Partners List */}
                <div className="text-center pt-10">
                    <div className="flex flex-col items-center gap-8">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em]">Verified Network Nodes</span>
                        <div className="flex justify-center">
                            <a href="https://rocheats.com?ref=slenderscripts" target="_blank" rel="noopener noreferrer" className="group/partner flex flex-col items-center gap-4 opacity-50 hover:opacity-100 transition-all duration-500">
                                <div className="w-24 h-24 bg-slate-950/80 rounded-[2rem] flex items-center justify-center border border-white/5 group-hover/partner:border-indigo-500/40 transition-colors overflow-hidden p-4 shadow-2xl relative">
                                    <div className="absolute inset-0 bg-indigo-500/5 group-hover/partner:bg-indigo-500/10 transition-colors"></div>
                                    <img
                                        src="/rocheats-logo.png"
                                        alt="RoCheats"
                                        className="w-full h-full object-contain relative z-10 drop-shadow-lg group-hover/partner:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-white tracking-[0.4em] uppercase opacity-50 group-hover/partner:opacity-100 transition-opacity">RoCheats</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutView;
