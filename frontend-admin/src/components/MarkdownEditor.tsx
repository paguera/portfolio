import React, { useState, useRef } from 'react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  label = 'Description détaillée (Markdown)',
  placeholder = 'Rédigez la présentation détaillée du projet en Markdown (titres #, listes, code, liens)...'
}) => {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const replacement = `${prefix}${selectedText || 'texte'}${suffix}`

    const newValue = value.substring(0, start) + replacement + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 'texte'.length)
      )
    }, 0)
  }

  // Simple and fast markdown renderer for live preview without external dependencies
  const renderSimpleMarkdown = (md: string) => {
    if (!md) return '<p class="text-gray-500 italic">Aucun contenu Markdown à prévisualiser.</p>'

    let html = md
      // Escaping HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-secondary mt-4 mb-2 uppercase">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-black text-white mt-5 mb-2 border-b border-border-subtle pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-black text-white mt-6 mb-3 border-b-2 border-secondary pb-1">$1</h1>')
      // Bold & Italic
      .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="text-gray-300 italic">$1</em>')
      // Inline Code & Code Blocks
      .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre class="bg-black/80 border border-border-subtle p-3 rounded my-3 overflow-x-auto text-xs font-mono text-emerald-400"><code>$2</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-black/60 px-1.5 py-0.5 border border-border-subtle text-secondary rounded font-mono text-xs">$1</code>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-secondary pl-3 my-2 text-gray-400 italic bg-secondary/5 py-1">$1</blockquote>')
      // Unordered Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-0.5">$1</li>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-0.5">$1</li>')
      // Ordered Lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-gray-300 my-0.5">$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-secondary underline hover:text-white">$1</a>')
      // Line breaks
      .replace(/\n\n/gim, '</p><p class="my-2 leading-relaxed">')

    return `<div class="prose prose-invert max-w-none text-xs sm:text-sm font-sans text-gray-300"><p class="my-2 leading-relaxed">${html}</p></div>`
  }

  return (
    <div className='flex flex-col gap-2 font-mono'>
      <div className='flex justify-between items-center'>
        <label className='text-xs font-black uppercase tracking-widest text-gray-500'>
          {label}
        </label>

        {/* Tab Controls */}
        <div className='flex gap-1 bg-bg-main border border-border-subtle p-0.5 text-xs'>
          <button
            type='button'
            onClick={() => setTab('write')}
            className={`px-3 py-1 uppercase font-bold transition-all cursor-pointer ${
              tab === 'write' ? 'bg-secondary text-bg-main' : 'text-gray-400 hover:text-white'
            }`}
          >
            Édition
          </button>
          <button
            type='button'
            onClick={() => setTab('preview')}
            className={`px-3 py-1 uppercase font-bold transition-all cursor-pointer ${
              tab === 'preview' ? 'bg-secondary text-bg-main' : 'text-gray-400 hover:text-white'
            }`}
          >
            Aperçu
          </button>
        </div>
      </div>

      {tab === 'write' ? (
        <div className='flex flex-col border border-border-subtle bg-bg-main'>
          {/* Formatting Toolbar */}
          <div className='flex flex-wrap gap-1 p-2 bg-bg-panel border-b border-border-subtle text-xs'>
            <button
              type='button'
              onClick={() => insertFormatting('## ')}
              className='px-2 py-1 bg-bg-main border border-border-subtle hover:border-secondary text-gray-300 font-bold'
              title='Titre H2'
            >
              H2
            </button>
            <button
              type='button'
              onClick={() => insertFormatting('### ')}
              className='px-2 py-1 bg-bg-main border border-border-subtle hover:border-secondary text-gray-300 font-bold'
              title='Titre H3'
            >
              H3
            </button>
            <button
              type='button'
              onClick={() => insertFormatting('**', '**')}
              className='px-2.5 py-1 bg-bg-main border border-border-subtle hover:border-secondary text-gray-300 font-bold'
              title='Gras'
            >
              B
            </button>
            <button
              type='button'
              onClick={() => insertFormatting('*', '*')}
              className='px-2.5 py-1 bg-bg-main border border-border-subtle hover:border-secondary text-gray-300 italic'
              title='Italique'
            >
              I
            </button>
            <button
              type='button'
              onClick={() => insertFormatting('- ')}
              className='px-2 py-1 bg-bg-main border border-border-subtle hover:border-secondary text-gray-300'
              title='Liste à puces'
            >
              • Liste
            </button>
            <button
              type='button'
              onClick={() => insertFormatting('`', '`')}
              className='px-2 py-1 bg-bg-main border border-border-subtle hover:border-secondary text-secondary font-mono'
              title='Code en ligne'
            >
              &lt;/&gt;
            </button>
            <button
              type='button'
              onClick={() => insertFormatting('```ts\n', '\n```')}
              className='px-2 py-1 bg-bg-main border border-border-subtle hover:border-secondary text-secondary font-mono'
              title='Bloc de code'
            >
              Bloc Code
            </button>
            <button
              type='button'
              onClick={() => insertFormatting('[', '](https://...)')}
              className='px-2 py-1 bg-bg-main border border-border-subtle hover:border-secondary text-gray-300'
              title='Lien web'
            >
              🔗 Lien
            </button>
            <button
              type='button'
              onClick={() => insertFormatting('> ')}
              className='px-2 py-1 bg-bg-main border border-border-subtle hover:border-secondary text-gray-300'
              title='Citation / Note'
            >
              ❝ Note
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className='bg-bg-main p-3 outline-none focus:border-secondary text-text-main font-mono text-sm min-h-48 resize-y'
          />
        </div>
      ) : (
        <div
          className='bg-bg-main border border-border-subtle p-4 min-h-48 max-h-96 overflow-y-auto'
          dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(value) }}
        />
      )}
    </div>
  )
}

export default MarkdownEditor
