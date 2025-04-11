"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  LinkIcon,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CheckCircle2,
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
}

type SaveStatus = "unsaved" | "saving" | "saved";

export function TiptapEditor({ content, onChange, onSave }: TiptapEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  // Create a debounced save function
  const debouncedSave = useCallback(
    debounce(async (html: string) => {
      if (onSave) {
        setSaveStatus("saving");
        await onSave(html);
        setSaveStatus("saved");

        // Reset to empty state after 3 seconds
        setTimeout(() => {
          setSaveStatus("unsaved");
        }, 3000);
      }
    }, 1000),
    [onSave]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "tiptap-paragraph",
          },
        },
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing your post content here...",
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      // Calculate word count manually
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter((word) => word.length > 0).length);

      // Mark as unsaved and trigger save
      if (saveStatus !== "saving") {
        setSaveStatus("unsaved");
      }
      if (onSave) {
        debouncedSave(html);
      }
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none w-full",
      },
      handlePaste: (view, event) => {
        // Get the clipboard text content
        const text = event.clipboardData?.getData("text/plain");

        if (text && !event.clipboardData?.types.includes("text/html")) {
          // Insert the text at the current cursor position
          const { state } = view;
          const tr = state.tr.insertText(text);
          view.dispatch(tr);
          return true; // Prevent the default paste behavior
        }

        return false; // Allow default paste behavior for HTML content
      },
    },
  });

  // Add the debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        func(...args);
      };

      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    };
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
          type="button"
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
          type="button"
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
          type="button"
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
          type="button"
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <span className="w-px h-5 bg-border mx-1"></span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
          type="button"
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
          type="button"
          aria-label="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <span className="w-px h-5 bg-border mx-1"></span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-muted" : ""}
          type="button"
          aria-label="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "bg-muted" : ""}
          type="button"
          aria-label="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
        <span className="w-px h-5 bg-border mx-1"></span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt("Enter image URL");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          type="button"
          aria-label="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt("Enter link URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={editor.isActive("link") ? "bg-muted" : ""}
          type="button"
          aria-label="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <span className="w-px h-5 bg-border mx-1"></span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}
          type="button"
          aria-label="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""}
          type="button"
          aria-label="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""}
          type="button"
          aria-label="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="prose prose-sm sm:prose-base max-w-none cursor-text h-[400px] overflow-y-auto"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

      <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground flex justify-between items-center">
        <div>{wordCount} words</div>
        <div className="flex items-center">
          {saveStatus === "saving" && (
            <span className="text-muted-foreground animate-pulse">
              Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-green-600 flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Saved
            </span>
          )}
          {saveStatus === "unsaved" && (
            <span>Click anywhere in the editor to start writing</span>
          )}
        </div>
      </div>
    </div>
  );
}
