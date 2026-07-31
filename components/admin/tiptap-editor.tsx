"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faListUl,
  faListOl,
  faQuoteLeft,
  faCode,
  faLink,
  faImage,
  faMinus,
  faRotateLeft,
  faRotateRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const lowlight = createLowlight(common);

type Props = {
  content: string;
  onChange: (html: string) => void;
};

type Dialog = "link" | "image" | null;

function isSafeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`tiptap-toolbar-btn ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="tiptap-toolbar-divider" aria-hidden="true" />;
}

export default function TiptapEditor({ content, onChange }: Props) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [notice, setNotice] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4], HTMLAttributes: {} },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        isAllowedUri: (href, context) =>
          href.startsWith("/") || context.defaultValidate(href),
      }),
      Image.configure({ allowBase64: false, HTMLAttributes: { class: "" } }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: "Start writing your post..." }),
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    editorProps: {
      attributes: { class: "tiptap-content markdown-body" },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    if (editor.state.selection.empty && !editor.isActive("link")) {
      setNotice("Select text before adding a link.");
      return;
    }
    setUrl(editor.getAttributes("link").href || "https://");
    setAltText("");
    setDialogError("");
    setDialog("link");
  }, [editor]);

  const openImageDialog = useCallback(() => {
    setUrl("https://");
    setAltText("");
    setDialogError("");
    setDialog("image");
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
    setDialogError("");
  }, []);

  const submitDialog = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!editor || !dialog) return;

      const nextUrl = url.trim();
      if (!isSafeExternalUrl(nextUrl)) {
        setDialogError("Enter a valid http or https URL.");
        return;
      }

      if (dialog === "link") {
        editor.chain().focus().extendMarkRange("link").setLink({ href: nextUrl }).run();
      } else {
        editor.chain().focus().setImage({ src: nextUrl, alt: altText.trim() }).run();
      }
      closeDialog();
    },
    [altText, closeDialog, dialog, editor, url]
  );

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    closeDialog();
  }, [closeDialog, editor]);

  if (!editor) {
    return <div className="tiptap-editor tiptap-editor--loading" aria-busy="true" />;
  }

  return (
    <div className="tiptap-editor">
      <div className="tiptap-toolbar" role="toolbar" aria-label="Formatting options">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <FontAwesomeIcon icon={faBold} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <FontAwesomeIcon icon={faItalic} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <FontAwesomeIcon icon={faUnderline} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <FontAwesomeIcon icon={faStrikethrough} />
        </ToolbarButton>
        <ToolbarDivider />
        {[1, 2, 3].map((level) => (
          <ToolbarButton
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
            active={editor.isActive("heading", { level })}
            title={`Heading ${level}`}
          >
            H{level}
          </ToolbarButton>
        ))}
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <FontAwesomeIcon icon={faListUl} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          <FontAwesomeIcon icon={faListOl} />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          <FontAwesomeIcon icon={faQuoteLeft} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
          <FontAwesomeIcon icon={faCode} />
        </ToolbarButton>
        <ToolbarButton onClick={openLinkDialog} active={editor.isActive("link")} title="Add or edit link">
          <FontAwesomeIcon icon={faLink} />
        </ToolbarButton>
        <ToolbarButton onClick={openImageDialog} title="Insert image">
          <FontAwesomeIcon icon={faImage} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <FontAwesomeIcon icon={faMinus} />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <FontAwesomeIcon icon={faRotateLeft} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <FontAwesomeIcon icon={faRotateRight} />
        </ToolbarButton>
      </div>

      {notice && <p className="tiptap-notice" role="status">{notice}</p>}
      <EditorContent editor={editor} className="tiptap-editor-content" />

      {dialog && (
        <div className="tiptap-dialog-backdrop" role="presentation" onMouseDown={closeDialog}>
          <form
            className="tiptap-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tiptap-dialog-title"
            onSubmit={submitDialog}
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeDialog();
            }}
          >
            <div className="tiptap-dialog-heading">
              <h2 id="tiptap-dialog-title">{dialog === "link" ? "Add link" : "Insert image"}</h2>
              <button type="button" className="tiptap-dialog-close" onClick={closeDialog} aria-label="Close dialog">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <label htmlFor="editor-resource-url">{dialog === "link" ? "Link URL" : "Image URL"}</label>
            <input
              id="editor-resource-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              autoFocus
              required
            />
            {dialog === "image" && (
              <>
                <label htmlFor="editor-image-alt">Alternative text <span>(optional)</span></label>
                <input
                  id="editor-image-alt"
                  type="text"
                  value={altText}
                  onChange={(event) => setAltText(event.target.value)}
                  placeholder="Describe the image"
                />
              </>
            )}
            {dialogError && <p className="tiptap-dialog-error" role="alert">{dialogError}</p>}
            <div className="tiptap-dialog-actions">
              {dialog === "link" && editor.isActive("link") && <button type="button" className="tiptap-dialog-remove" onClick={removeLink}>Remove link</button>}
              <button type="button" onClick={closeDialog}>Cancel</button>
              <button type="submit">{dialog === "link" ? "Add link" : "Insert image"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
