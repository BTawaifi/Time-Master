import React from "react";

export const BackgroundEffects = ({ effectId, isAlerting }) => {
    const alertClass = isAlerting ? 'animate-alert-pulse' : '';
    
    // Render the selected effect
    switch (effectId) {
        case "none":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible z-0 opacity-20 ${alertClass}`}>
                    <div className="grid grid-cols-4 grid-rows-4 gap-2 w-[400px] h-[400px]">
                        {[...Array(16)].map((_, i) => (
                            <div key={i} className="bg-app-primary/10 border border-app-primary/20 animate-[pulse-transform_4s_ease-in-out_infinite]" style={{ animationDelay: `${(i % 4) * -1.5}s`, borderRadius: i % 3 === 0 ? '50%' : '5px' }}></div>
                        ))}
                    </div>
                </div>
            );
            
        case "fluidAura":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible will-animate ${alertClass}`}>
                    <div className="absolute w-[450px] h-[450px] bg-app-primary/[0.03] rounded-full blur-[100px] animate-[pulse-transform_8s_ease-in-out_infinite] will-animate"></div>
                    <div className="absolute w-[320px] h-[320px] border border-app-primary/10 rounded-full animate-[tunnel-flow_25s_linear_infinite] opacity-40 will-animate"></div>
                    <div className="absolute w-[280px] h-[280px] border border-app-primary/10 rounded-full animate-[tunnel-flow_20s_linear_infinite_reverse] opacity-20 will-animate"></div>
                </div>
            );
            
        case "orbitNodes":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible will-animate ${alertClass}`}>
                    <div className="absolute w-[350px] h-[350px] rounded-full border border-app-primary/5"></div>
                    <div className="absolute w-[320px] h-[320px] animate-[rotate-slow_15s_linear_infinite] will-animate">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-app-primary/60 shadow-[0_0_10px_var(--accent-color)]"></div>
                    </div>
                    <div className="absolute w-[280px] h-[280px] animate-[rotate-slow_25s_linear_infinite_reverse] will-animate">
                        <div className="absolute bottom-1/4 right-0 w-1 h-1 rounded-full bg-app-primary/40 shadow-[0_0_8px_var(--accent-color)]"></div>
                    </div>
                </div>
            );
            
        case "stroboscopic":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible ${alertClass}`}>
                    <div className="absolute w-[400px] h-[400px] bg-app-primary/20 rounded-full blur-[80px] animate-[strobo-pulse_2s_steps(2,end)_infinite]"></div>
                    <div className="absolute w-[300px] h-[300px] border border-app-primary border-dashed rounded-full animate-[strobo-pulse_1s_steps(2,end)_infinite] opacity-50"></div>
                </div>
            );
            
        case "sonarPing":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible ${alertClass}`}>
                    <div className="absolute w-[100px] h-[100px] rounded-full border border-app-primary animate-[sonar-ping_4s_ease-out_infinite] opacity-0"></div>
                    <div className="absolute w-[100px] h-[100px] rounded-full border border-app-primary animate-[sonar-ping_4s_ease-out_infinite] [animation-delay:2s] opacity-0"></div>
                    <div className="absolute w-[200px] h-[200px] bg-app-primary/5 rounded-full blur-[50px]"></div>
                </div>
            );

        case "cyberGrid":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden ${alertClass}`}>
                    <div className="absolute inset-0 opacity-20" style={{ 
                        backgroundImage: 'linear-gradient(var(--accent-color) 1px, transparent 1px), linear-gradient(90deg, var(--accent-color) 1px, transparent 1px)', 
                        backgroundSize: '40px 40px',
                        transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
                        animation: 'grid-scroll 10s linear infinite'
                    }}></div>
                </div>
            );

        case "waveRipple":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible ${alertClass}`}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="absolute w-[200px] h-[200px] rounded-full border border-app-primary/20 animate-[wave-ripple_8s_linear_infinite]" style={{ animationDelay: `${i * -1.6}s` }}></div>
                    ))}
                </div>
            );

        case "plasmaField":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible z-0 opacity-20 ${alertClass}`}>
                    <svg className="w-[800px] h-[800px] animate-[rotate-slow_15s_linear_infinite]" viewBox="0 0 100 100" style={{ transformOrigin: '50% 50%' }}>
                        <polygon points="10,90 95,85 75,10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-app-primary/30" strokeDasharray="5 5" />
                        <polygon points="5,85 85,95 65,5" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-app-success/20 animate-[pulse-transform_5s_ease-in-out_infinite]" style={{ transformOrigin: '50% 50%' }} />
                    </svg>
                    <div className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-app-primary/10 to-transparent blur-[60px] animate-[pulse-transform_10s_ease-in-out_infinite_alternate]" style={{ borderRadius: '70% 30% 30% 70% / 60% 40% 60% 40%' }}></div>
                </div>
            );

        case "neonWeb":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible ${alertClass}`}>
                    <svg className="w-[600px] h-[600px] opacity-30 animate-[rotate-slow_120s_linear_infinite]" viewBox="0 0 100 100">
                        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-app-primary" />
                        <polygon points="50,20 80,38 80,62 50,80 20,62 20,38" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-app-primary" />
                        <polygon points="50,30 70,45 70,55 50,70 30,55 30,45" fill="none" stroke="currentColor" strokeWidth="0.1" className="text-app-primary" />
                        <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.1" className="text-app-primary/50" />
                        <line x1="10" y1="30" x2="90" y2="70" stroke="currentColor" strokeWidth="0.1" className="text-app-primary/50" />
                        <line x1="10" y1="70" x2="90" y2="30" stroke="currentColor" strokeWidth="0.1" className="text-app-primary/50" />
                    </svg>
                </div>
            );

        case "chronosDial":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible ${alertClass}`}>
                    <svg className="w-[500px] h-[500px] opacity-20" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-app-primary" strokeDasharray="1 4" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-app-primary animate-[rotate-slow_60s_linear_infinite]" strokeDasharray="10 10" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" className="text-app-primary/50 animate-[rotate-slow_30s_linear_infinite_reverse]" strokeDasharray="20 40" />
                    </svg>
                </div>
            );

        case "auroraBorealis":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible z-0 opacity-20 ${alertClass}`}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute border border-app-primary/40 rotate-45 animate-[pulse-transform_8s_ease-in-out_infinite]" style={{
                            width: `${100 + i * 80}px`,
                            height: `${100 + i * 80}px`,
                            animationDelay: `${i * -1.2}s`,
                            opacity: 1 - (i * 0.15),
                            boxShadow: 'inset 0 0 20px var(--accent-color)'
                        }}></div>
                    ))}
                </div>
            );

        case "binaryPulse":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-10 ${alertClass}`}>
                    <div className="absolute bottom-[-100px] w-[800px] h-[400px]" style={{
                        transform: 'perspective(400px) rotateX(70deg)',
                        backgroundImage: 'linear-gradient(var(--accent-color) 2px, transparent 2px), linear-gradient(90deg, var(--accent-color) 2px, transparent 2px)',
                        backgroundSize: '50px 50px',
                        animation: 'matrix-fall 8s linear infinite',
                        opacity: 0.2
                    }}></div>
                </div>
            );

        case "quantumFoam":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible z-0 opacity-20 ${alertClass}`}>
                    <svg className="w-[600px] h-[600px] opacity-40 animate-[rotate-slow_30s_linear_infinite]" viewBox="0 0 100 100" style={{ transformOrigin: '50% 50%' }}>
                        <path d="M 0 50 Q 25 10 50 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="1" className="text-app-primary" />
                        <path d="M 0 50 Q 25 90 50 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="1" className="text-app-primary" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-app-success" />
                    </svg>
                    <svg className="absolute w-[600px] h-[600px] opacity-20 animate-[rotate-slow_20s_linear_infinite_reverse]" viewBox="0 0 100 100" style={{ transformOrigin: '50% 50%' }}>
                        <path d="M 50 0 Q 10 25 50 50 T 50 100" fill="none" stroke="currentColor" strokeWidth="2" className="text-app-success" />
                    </svg>
                </div>
            );

        case "galaxySpiral":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible z-0 opacity-10 ${alertClass}`}>
                    <svg className="w-[600px] h-[600px]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4" className="text-app-primary/40 animate-[rotate-slow_4s_linear_infinite] origin-center" strokeDasharray="10 200" strokeLinecap="round" style={{ transformOrigin: '50% 50%' }} />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="3" className="text-app-success/40 animate-[rotate-slow_8s_linear_infinite_reverse] origin-center" strokeDasharray="40 100" strokeLinecap="round" style={{ transformOrigin: '50% 50%' }} />
                        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="6" className="text-app-primary/60 animate-[rotate-slow_2s_linear_infinite] origin-center" strokeDasharray="5 50" strokeLinecap="round" style={{ transformOrigin: '50% 50%' }} />
                        <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-app-primary/20 animate-[rotate-slow_1s_linear_infinite_reverse] origin-center" strokeDasharray="2 10" strokeLinecap="round" style={{ transformOrigin: '50% 50%' }} />
                    </svg>
                </div>
            );

        case "cellular":
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden ${alertClass}`}>
                    <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 opacity-10 w-[600px] h-[600px]">
                        {[...Array(400)].map((_, i) => (
                            <div key={i} className="bg-app-primary rounded-sm animate-[cell-pulse_3s_steps(2)_infinite]" style={{ animationDelay: `${Math.random() * -3}s` }}></div>
                        ))}
                    </div>
                </div>
            );

        case "geometric":
            return (
                 <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible ${alertClass}`}>
                    <svg className="w-[600px] h-[600px] opacity-10" viewBox="0 0 100 100">
                         {[...Array(10)].map((_, i) => (
                             <rect key={i} x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-app-primary animate-[rotate-slow_linear_infinite]" style={{
                                 transformOrigin: '50% 50%',
                                 animationDuration: `${30 + i * 10}s`,
                                 transform: `scale(${1 - i*0.08})`
                             }}/>
                         ))}
                    </svg>
                 </div>
            );

        case "crystalline":
             return (
                 <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible ${alertClass}`}>
                    <svg className="w-[500px] h-[500px] opacity-20" viewBox="0 0 100 100">
                        <path d="M50 5 L90 50 L50 95 L10 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-app-primary animate-[pulse-transform_10s_ease-in-out_infinite]" />
                        <path d="M50 20 L75 50 L50 80 L25 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-app-primary animate-[pulse-transform_8s_ease-in-out_infinite_reverse]" />
                        <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.2" className="text-app-primary" />
                        <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.2" className="text-app-primary" />
                    </svg>
                 </div>
             );

        case "matrix":
             return (
                  <div className={`absolute inset-0 flex space-x-4 pointer-events-none select-none overflow-hidden opacity-20 justify-center ${alertClass}`}>
                      {[...Array(15)].map((_, i) => (
                          <div key={i} className="w-1 bg-gradient-to-b from-transparent via-app-primary to-transparent animate-[matrix-fall_linear_infinite]" style={{
                              height: `${Math.random() * 200 + 100}px`,
                              animationDuration: `${Math.random() * 2 + 1}s`,
                              animationDelay: `${Math.random() * -3}s`
                          }}></div>
                      ))}
                  </div>
             );

        case "singularity":
             return (
                  <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible ${alertClass}`}>
                     <div className="absolute w-[20px] h-[20px] bg-black rounded-full shadow-[0_0_100px_var(--accent-color)] z-10 border border-app-primary/50"></div>
                     <div className="absolute w-[300px] h-[300px] rounded-full border border-app-primary/10 animate-[singularity-spin_4s_linear_infinite] border-dashed"></div>
                     <div className="absolute w-[200px] h-[200px] rounded-full border-2 border-app-primary/20 animate-[singularity-spin_2s_linear_infinite_reverse] border-dotted"></div>
                  </div>
             );

        case "neuralTracer":
        default:
            return (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-visible ${alertClass}`}>
                    <div className="absolute w-[600px] h-[600px] bg-app-primary/[0.04] rounded-full blur-[140px]"></div>
                    <svg className="w-[700px] h-[700px] opacity-40 will-change-transform" viewBox="0 0 500 500">
                        <circle cx="250" cy="250" r="230" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-app-primary/10" />
                        <circle cx="250" cy="250" r="200" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-app-primary/10" />
                        <circle cx="250" cy="250" r="170" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-app-primary/10" />
                        
                        <circle cx="250" cy="250" r="230" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="100 1000" className="text-app-primary animate-[tracer-spin_15s_linear_infinite]" style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }} />
                        <circle cx="250" cy="250" r="200" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="80 1000" className="text-app-primary animate-[tracer-spin_22s_linear_infinite_reverse]" style={{ filter: 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.3))' }} />
                        <circle cx="250" cy="250" r="170" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="60 1000" className="text-app-primary animate-[tracer-spin_10s_linear_infinite]" style={{ filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))' }} />
                    </svg>
                </div>
            );
    }
}

