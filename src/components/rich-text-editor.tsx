'use client'

import * as React from 'react'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  ListsToggle,
  BlockTypeSelect,
  linkDialogPlugin,
  CreateLink,
  UndoRedo,
  Separator,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = React.useRef<MDXEditor>(null)

  return (
    <div className="rounded-md border border-border overflow-hidden bg-background">
      <MDXEditor
        ref={editorRef}
        markdown={value || ''}
        onChange={(md) => onChange(md)}
        placeholder={placeholder || 'Tulis konten di sini...'}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <ListsToggle />
                <Separator />
                <CreateLink />
              </>
            ),
          }),
        ]}
        className="min-h-[300px] [&_.mdxeditor]:!bg-transparent [&_.mdxeditor]:!font-sans [&_.mdxeditor]:!text-foreground"
        contentEditableClassName="prose prose-sm dark:prose-invert max-w-none p-4 focus:outline-none min-h-[300px]"
      />
    </div>
  )
}
