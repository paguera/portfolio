import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const renderMarkdown = (md: string) => {
    let html = md
      // Escape
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Code blocks with syntax appearance
      .replace(
        /```([a-z]*)\n([\s\S]*?)```/gim,
        '<div class="my-4 overflow-hidden rounded-lg border border-border-subtle bg-black/90 shadow-xl"><div class="flex items-center justify-between px-4 py-1.5 bg-bg-panel border-b border-border-subtle text-[11px] font-mono text-gray-400"><span>Code</span><span>$1</span></div><pre class="p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed"><code>$2</code></pre></div>'
      )
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-cyber-yellow mt-6 mb-3 uppercase tracking-wider font-mono">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl sm:text-2xl font-black text-white mt-8 mb-4 border-b-2 border-border-subtle pb-2 uppercase tracking-tight">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl sm:text-3xl font-black text-white mt-10 mb-5 border-b-4 border-cyber-yellow pb-2 uppercase tracking-tight">$1</h1>')
      // Bold & Italic
      .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="text-gray-300 italic">$1</em>')
      // Inline Code
      .replace(/`([^`]+)`/gim, '<code class="bg-black/80 px-2 py-0.5 border border-border-subtle text-cyber-yellow rounded font-mono text-xs font-bold">$1</code>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-cyber-blue pl-4 py-2 my-4 text-gray-300 bg-cyber-blue/10 font-sans italic rounded-r">$1</blockquote>')
      // Unordered Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc text-gray-300 my-1 font-sans leading-relaxed">$1</li>')
      .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc text-gray-300 my-1 font-sans leading-relaxed">$1</li>')
      // Ordered Lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal text-gray-300 my-1 font-sans leading-relaxed">$1</li>')
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/gim,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyber-yellow underline hover:text-white font-bold transition-colors">$1 ↗</a>'
      )
      // Paragraph breaks
      .replace(/\n\n/gim, '</p><p class="my-3 leading-relaxed font-sans text-gray-300 text-sm sm:text-base">');

    return `<div class="prose prose-invert max-w-none"><p class="my-3 leading-relaxed font-sans text-gray-300 text-sm sm:text-base">${html}</p></div>`;
  };

  return (
    <div
      className={`markdown-content leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export default MarkdownView;
