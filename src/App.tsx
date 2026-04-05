/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
    // hello@jaswinder.cc reversed
    const reversed = "cc.redniwsaj@olleh";
    return (
      <span 
        className="inline-block cursor-default select-all font-medium" 
        style={{ unicodeBidi: 'bidi-override', direction: 'rtl' }}
      >
        {reversed}
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

  return (
    <main
      className="relative min-h-screen w-full flex flex-col p-8 md:p-16 lg:p-24"
      role="main"
      aria-label="Jaswinder Singh Executive Technical Portfolio"
    >
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
