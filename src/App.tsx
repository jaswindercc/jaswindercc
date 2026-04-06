/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function App() {
  const projects = [
    {
      title: "Agentic AI Reasoning Loop for Compliance",
      company: "[Confidential]",
      value: "Part of a major technology portfolio.",
      problem: "Manual auditing of complex spatial data was slow, prone to human error, and hindered real-time decision-making.",
      solution: "Architected a multi-agent \"Reasoning Loop\" (ReAct) with embedded guardrails to automate spatial analysis.",
      impact: "Reduced manual auditing effort by 70%.",
      technologies: ["LangGraph", "Vector Search (RAG)", "Python", "Azure AI Studio", "Prompt Engineering"]
    },
    {
      title: "Enterprise Cloud & DevOps Modernization",
      company: "[Confidential]",
      value: "Operational efficiency initiative.",
      problem: "Fragmented legacy codebases and inconsistent CI/CD pipelines created deployment bottlenecks and security risks.",
      solution: "Led the end-to-end migration of 100+ mission-critical repositories to a centralized enterprise platform.",
      impact: "Standardized global deployment blueprints and increased developer velocity through a new Cloud Center of Excellence (CCoE).",
      technologies: ["GitHub Enterprise (GHE)", "Azure DevOps", "Terraform", "Kubernetes", "GitHub Actions"]
    },
    {
      title: "AI Video Spatial Crowd Analytics",
      company: "[Confidential]",
      value: "Revenue protection project.",
      problem: "Traditional analytics couldn't accurately detect fare evasion or monitor crowd density in high-concurrency transit environments.",
      solution: "Directed the delivery of a real-time AI spatial analysis system for video feeds.",
      impact: "Optimized revenue protection and improved operational security for public transit systems.",
      technologies: ["PyTorch", "TensorFlow", "Computer Vision", "Azure ML", "High-Concurrency Infrastructure"]
    },
    {
      title: "Regulatory MLOps Project",
      company: "[Confidential]",
      value: "Governance and audit-readiness project.",
      problem: "AI models lacked transparency and automated monitoring, risking non-compliance with provincial and financial (OSFI) standards.",
      solution: "Built an automated MLOps pipeline featuring Model Drift detection and full lineage tracking.",
      impact: "Ensured 100% audit-readiness and met OSFI-level transparency requirements for enterprise AI.",
      technologies: ["MLflow", "Azure ML", "Databricks Unity Catalog", "Apache Airflow"]
    },
    {
      title: "Enterprise Observability & FinOps Transformation",
      company: "[Confidential]",
      value: "Optimized multi-cloud spend.",
      problem: "High-concurrency systems lacked deep visibility, and cloud costs were scaling inefficiently without governance.",
      solution: "Implemented a unified observability platform and established FinOps guardrails.",
      impact: "Dramatically reduced cloud waste and ensured 99.9% uptime for mission-critical payment systems.",
      technologies: ["Elastic Stack", "Azure Cost Management", "Sentinel", "Prometheus", "Grafana"]
    },
    {
      title: "Retail Banking API Integration Architecture",
      company: "[Confidential]",
      value: "Transactional ecosystem.",
      problem: "Disconnected retail and banking systems prevented seamless e-commerce transactions and real-time data synchronization.",
      solution: "Designed complex API integrations and high-traffic SQL Server architectures.",
      impact: "Supported the full lifecycle of national retail banking applications with high-concurrency post-launch stability.",
      technologies: [".NET", "SQL Server", "Web API", "Enterprise Service Bus (ESB)"]
    },
    {
      title: "Zero Trust Security Framework for Cloud",
      company: "[Confidential]",
      value: "Part of enterprise-wide security hardening.",
      problem: "Traditional perimeter-based security was insufficient for protecting sensitive data in multi-cloud environments.",
      solution: "Orchestrated a Zero Trust Architecture aligned with NIST and ISO 27001 standards.",
      impact: "Secured critical payment data and infrastructure against adversarial threats.",
      technologies: ["Azure Key Vault", "IAM", "Network Security Groups (NSG)", "Microsoft Sentinel"]
    }
  ];

  const ProtectedEmail = () => {
    const [email, setEmail] = React.useState("");
    
    React.useEffect(() => {
      // Deconstruct to hide from simple string scrapers
      const u = "hello";
      const d = "jaswinder.cc";
      setEmail(`${u}@${d}`);
    }, []);

    const copyToClipboard = () => {
      if (email) {
        navigator.clipboard.writeText(email);
      }
    };

    return (
      <span 
        className="inline-block cursor-pointer hover:opacity-70 transition-opacity font-medium" 
        onClick={copyToClipboard}
        title="Click to copy email"
      >
        {email || "loading..."}
      </span>
    );
  };

  const SocialLinks = ({ delay = "0ms" }: { delay?: string }) => (
    <nav 
      className="flex flex-wrap justify-end gap-x-6 md:gap-x-8 gap-y-4 text-xs md:text-sm font-medium reveal-staggered"
      style={{ animationDelay: delay }}
      aria-label="Social and Contact Links"
    >
      <a 
        href="https://twitter.com/jaswinder_cc" 
        target="_blank" 
        rel="noopener noreferrer"
        className="magnetic-link hover:opacity-50 underline-offset-4 hover:underline"
      >
        Twitter/X
      </a>
      <a 
        href="https://youtube.com/@jaswinder_cc" 
        target="_blank" 
        rel="noopener noreferrer"
        className="magnetic-link hover:opacity-50 underline-offset-4 hover:underline"
      >
        YouTube
      </a>
      <a 
        href="https://github.com/jaswindercc" 
        target="_blank" 
        rel="noopener noreferrer"
        className="magnetic-link hover:opacity-50 underline-offset-4 hover:underline"
      >
        GitHub
      </a>
    </nav>
  );

  const KineticBackground = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let particles: any[] = [];
      let mouse = { x: 0, y: 0, radius: 150 };

      const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      };

      window.addEventListener('mousemove', handleMouseMove);

      class Particle {
        x: number;
        y: number;
        size: number;
        vx: number;
        vy: number;

        constructor() {
          this.x = Math.random() * canvas!.width;
          this.y = Math.random() * canvas!.height;
          this.size = Math.random() * 3 + 1.5;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
        }

        update() {
          this.x += this.vx;
          this.y += this.vy;

          if (this.x > canvas!.width || this.x < 0) this.vx *= -1;
          if (this.y > canvas!.height || this.y < 0) this.vy *= -1;

          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 0.5;
            this.y -= (dy / distance) * force * 0.5;
          }
        }

        draw() {
          ctx!.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx!.beginPath();
          ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      const init = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        const numberOfParticles = (canvas.width * canvas.height) / 15000;
        for (let i = 0; i < numberOfParticles; i++) {
          particles.push(new Particle());
        }
      };

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();

          for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.strokeStyle = `rgba(16, 185, 129, ${0.3 * (1 - distance / 100)})`;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        requestAnimationFrame(animate);
      };

      window.addEventListener('resize', init);
      init();
      animate();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', init);
      };
    }, []);

    return (
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-10 z-0"
      />
    );
  };

  const CSSJellyfish = () => (
    <div className="jelly-container fixed right-[8%] top-1/2 -translate-y-1/2 w-[120px] height-[300px] z-5 pointer-events-none opacity-25" aria-hidden="true">
      <style>{`
        .jelly-container {
          animation: jelly-float 20s ease-in-out infinite;
        }
        .jelly-bell {
          width: 100px;
          height: 70px;
          background: radial-gradient(circle at 50% 40%, rgba(0, 242, 255, 0.3) 0%, rgba(188, 19, 254, 0.1) 100%);
          border-radius: 50% 50% 45% 45%;
          position: relative;
          box-shadow: inset 0 5px 15px rgba(0, 242, 255, 0.4), 
                      inset 0 -5px 10px rgba(188, 19, 254, 0.2),
                      0 0 25px rgba(0, 242, 255, 0.2);
          animation: jelly-pulse 5s ease-in-out infinite;
          backdrop-filter: blur(2px);
        }
        .jelly-bell::before {
          content: '';
          position: absolute;
          top: 15%;
          left: 20%;
          width: 60%;
          height: 40%;
          background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 70%);
          border-radius: 50%;
        }
        .jelly-tentacles-svg {
          position: absolute;
          top: 60px;
          left: 0;
          width: 100px;
          height: 240px;
          overflow: visible;
          filter: blur(0.5px);
        }
        .jelly-path {
          fill: none;
          stroke-width: 1.2;
          stroke-linecap: round;
          opacity: 0.5;
        }

        @keyframes jelly-float {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-60%) translateX(15px); }
        }
        @keyframes jelly-pulse {
          0%, 100% { transform: scale(1, 1); border-radius: 50% 50% 45% 45%; }
          50% { transform: scale(1.1, 0.85); border-radius: 50% 50% 30% 30%; }
        }
        @keyframes tentacle-flow {
          0%, 100% { transform: rotate(0deg) skewX(0deg); }
          33% { transform: rotate(10deg) skewX(5deg); }
          66% { transform: rotate(-8deg) skewX(-5deg); }
        }
        @media (max-width: 768px) {
          .jelly-container { right: 5%; transform: scale(0.6) translateY(-50%); opacity: 0.3; }
        }
      `}</style>
      <div className="jelly-bell"></div>
      <svg className="jelly-tentacles-svg" viewBox="0 0 100 240">
        {/* Tentacle 1 */}
        <path className="jelly-path" stroke="#00f2ff">
          <animate attributeName="d" dur="5s" repeatCount="indefinite"
            values="M10,0 C10,20 15,40 10,60 C10,80 5,100 10,120;
                    M10,0 C5,20 10,40 15,60 C15,80 20,100 15,120;
                    M10,0 C10,20 15,40 10,60 C10,80 5,100 10,120" />
        </path>
        {/* Tentacle 2 */}
        <path className="jelly-path" stroke="#bc13fe" transform="translate(15, 0)">
          <animate attributeName="d" dur="7s" repeatCount="indefinite"
            values="M10,0 C5,30 15,60 10,90 C10,120 5,150 10,180;
                    M10,0 C15,30 10,60 5,90 C5,120 15,150 15,180;
                    M10,0 C5,30 15,60 10,90 C10,120 5,150 10,180" />
        </path>
        {/* Tentacle 3 */}
        <path className="jelly-path" stroke="#00f2ff" transform="translate(30, 0)">
          <animate attributeName="d" dur="6s" repeatCount="indefinite"
            values="M10,0 C15,25 5,50 10,75 C10,100 15,125 10,150;
                    M10,0 C5,25 15,50 10,75 C10,100 5,125 15,150;
                    M10,0 C15,25 5,50 10,75 C10,100 15,125 10,150" />
        </path>
        {/* Tentacle 4 */}
        <path className="jelly-path" stroke="#bc13fe" transform="translate(45, 0)">
          <animate attributeName="d" dur="8s" repeatCount="indefinite"
            values="M10,0 C10,40 20,80 10,120 C10,160 0,200 10,240;
                    M10,0 C0,40 10,80 20,120 C20,160 30,200 20,240;
                    M10,0 C10,40 20,80 10,120 C10,160 0,200 10,240" />
        </path>
        {/* Tentacle 5 */}
        <path className="jelly-path" stroke="#00f2ff" transform="translate(60, 0)">
          <animate attributeName="d" dur="5.5s" repeatCount="indefinite"
            values="M10,0 C5,20 15,40 10,60 C10,80 5,100 10,120;
                    M10,0 C15,20 10,40 5,60 C5,80 15,100 15,120;
                    M10,0 C5,20 15,40 10,60 C10,80 5,100 10,120" />
        </path>
        {/* Tentacle 6 */}
        <path className="jelly-path" stroke="#bc13fe" transform="translate(75, 0)">
          <animate attributeName="d" dur="7.5s" repeatCount="indefinite"
            values="M10,0 C15,35 5,70 10,105 C10,140 15,175 10,210;
                    M10,0 C5,35 15,70 10,105 C10,140 5,175 15,210;
                    M10,0 C15,35 5,70 10,105 C10,140 15,175 10,210" />
        </path>
        {/* Tentacle 7 */}
        <path className="jelly-path" stroke="#00f2ff" transform="translate(22, 0)" opacity="0.3">
          <animate attributeName="d" dur="6.5s" repeatCount="indefinite"
            values="M10,0 C10,25 15,50 10,75 C10,100 5,125 10,150;
                    M10,0 C5,25 10,50 15,75 C15,100 20,125 15,150;
                    M10,0 C10,25 15,50 10,75 C10,100 5,125 10,150" />
        </path>
        {/* Tentacle 8 */}
        <path className="jelly-path" stroke="#bc13fe" transform="translate(52, 0)" opacity="0.3">
          <animate attributeName="d" dur="8.5s" repeatCount="indefinite"
            values="M10,0 C5,40 15,80 10,120 C10,160 5,200 10,240;
                    M10,0 C15,40 10,80 5,120 C5,160 15,200 15,240;
                    M10,0 C5,40 15,80 10,120 C10,160 5,200 10,240" />
        </path>
        {/* Tentacle 9 */}
        <path className="jelly-path" stroke="#00f2ff" transform="translate(38, 0)" opacity="0.4">
          <animate attributeName="d" dur="5.8s" repeatCount="indefinite"
            values="M10,0 C15,20 5,40 10,60 C10,80 15,100 10,120;
                    M10,0 C5,20 15,40 10,60 C10,80 5,100 15,120;
                    M10,0 C15,20 5,40 10,60 C10,80 15,100 10,120" />
        </path>
        {/* Tentacle 10 */}
        <path className="jelly-path" stroke="#bc13fe" transform="translate(68, 0)" opacity="0.4">
          <animate attributeName="d" dur="7.2s" repeatCount="indefinite"
            values="M10,0 C10,30 20,60 10,90 C10,120 0,150 10,180;
                    M10,0 C0,30 10,60 20,90 C20,120 30,150 20,180;
                    M10,0 C10,30 20,60 10,90 C10,120 0,150 10,180" />
        </path>
      </svg>
    </div>
  );

  return (
    <main
      className="relative min-h-screen w-full flex flex-col p-8 md:p-16 lg:p-24"
      role="main"
      aria-label="Jaswinder Singh Executive Technical Portfolio"
    >
      <KineticBackground />
      <CSSJellyfish />
      {/* Header */}
      <header className="z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 md:mb-24">
        <div className="reveal-staggered" style={{ animationDelay: '0ms' }}>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase kinetic-logo">
            Jaswinder Singh
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <p className="text-sm md:text-base opacity-60 font-medium tracking-tight">
              AI & Cloud Leader
            </p>
            <span className="hidden md:block w-1 h-1 bg-onyx/20 rounded-full" aria-hidden="true" />
            <div className="flex items-center gap-2 px-2 py-0.5 bg-success/10 border border-success/20 rounded-full text-success text-xs md:text-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Contact:</span>
              <ProtectedEmail />
            </div>
          </div>
        </div>
        <SocialLinks delay="100ms" />
      </header>

      {/* What I Do Section */}
      <section className="mb-12 md:mb-16 max-w-4xl reveal-staggered" style={{ animationDelay: '200ms' }}>
        <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 mb-6">
          What I Do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-success">Scale Infrastructure</h3>
            <p className="text-base md:text-lg font-medium opacity-80 leading-snug">
              Architecting systems that handle high-volume, mission-critical traffic without failing.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-success">Deploy Agentic AI</h3>
            <p className="text-base md:text-lg font-medium opacity-80 leading-snug">
              Moving beyond basic prompts to build autonomous AI agents that solve real business problems.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-success">Technical Strategy</h3>
            <p className="text-base md:text-lg font-medium opacity-80 leading-snug">
              Translating executive goals into robust technical roadmaps that actually deliver ROI.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-success">Cloud Modernization</h3>
            <p className="text-base md:text-lg font-medium opacity-80 leading-snug">
              Leading large-scale migrations and establishing Cloud Centers of Excellence (CCoE) for governed growth.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Title */}
      <section className="mb-6 md:mb-8">
        <h2 className="inline-block text-xs md:text-sm font-bold tracking-[0.4em] uppercase opacity-60 reveal-staggered border-b border-success/30 pb-1" style={{ animationDelay: '300ms' }}>
          Executive Technical Portfolio
        </h2>
      </section>

      {/* Projects Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-24">
        {projects.map((project, index) => (
          <article 
            key={index}
            className="bento-card p-8 md:p-10 flex flex-col justify-between reveal-staggered"
            style={{ animationDelay: `${400 + index * 100}ms` }}
          >
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-success rounded-full" aria-hidden="true" />
                  <span className="text-xs font-bold tracking-widest uppercase text-success">{project.value}</span>
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-30">Company: {project.company}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 leading-tight">
                {project.title}
              </h3>
              
              <div className="space-y-6 text-sm md:text-base">
                <p><span className="font-bold uppercase tracking-wider text-[10px] opacity-40 block mb-1">Problem</span> {project.problem}</p>
                <p><span className="font-bold uppercase tracking-wider text-[10px] opacity-40 block mb-1">Solution</span> {project.solution}</p>
                <p><span className="font-bold uppercase tracking-wider text-[10px] opacity-40 block mb-1">Impact</span> {project.impact}</p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-onyx/5">
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, techIndex) => (
                  <span 
                    key={techIndex}
                    className="text-[10px] md:text-xs font-bold tracking-widest uppercase opacity-50 bg-onyx/5 px-2 py-1 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-end gap-12 z-10 mt-auto pt-12 border-t border-onyx/5">
        <div className="flex flex-col gap-2">
          <div className="text-xs md:text-sm font-bold tracking-widest uppercase opacity-40">
            © 2026 Jaswinder Singh. All Rights Reserved.
          </div>
          <div className="flex items-center gap-2 text-sm opacity-60">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Contact:</span>
            <ProtectedEmail />
          </div>
        </div>
        <SocialLinks delay="1200ms" />
      </footer>
    </main>
  );
}
