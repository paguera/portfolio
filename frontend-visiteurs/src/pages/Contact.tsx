import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { apiFetch } from "../utils/api";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-2 border-b border-border-subtle">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 border border-border-subtle font-black text-[10px] uppercase transition-colors ${editor.isActive("bold") ? "bg-primary text-bg-main" : "bg-bg-main text-text-main hover:border-primary"}`}
        type="button"
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 border border-border-subtle font-black text-[10px] uppercase transition-colors ${editor.isActive("italic") ? "bg-primary text-bg-main" : "bg-bg-main text-text-main hover:border-primary"}`}
        type="button"
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-3 py-1.5 border border-border-subtle font-black text-[10px] uppercase transition-colors ${editor.isActive("underline") ? "bg-primary text-bg-main" : "bg-bg-main text-text-main hover:border-primary"}`}
        type="button"
      >
        Underline
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1.5 border border-border-subtle font-black text-[10px] uppercase transition-colors ${editor.isActive("bulletList") ? "bg-primary text-bg-main" : "bg-bg-main text-text-main hover:border-primary"}`}
        type="button"
      >
        List
      </button>
      <button
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        className="px-3 py-1.5 border border-border-subtle font-black text-[10px] uppercase bg-bg-main text-text-muted hover:text-text-main transition-colors"
        type="button"
      >
        Clear
      </button>
    </div>
  );
};

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    sender: "",
    object: "",
  });
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "<p>Écrivez votre message ici...</p>",
    editorProps: {
      attributes: {
        class: "mx-auto focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const htmlContent = editor.getHTML();
      const textContent = editor.getText();
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          message: textContent,
          html: htmlContent,
        }),
      });
      setStatus({
        type: "success",
        message: "Votre message a été envoyé avec succès !",
      });
      setFormData({ name: "", sender: "", object: "" });
      editor.commands.setContent("<p>Écrivez votre message ici...</p>");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'envoi.";
      console.error(errorMessage, error);
      setStatus({ type: "error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact | GVF Portfolio</title>
        <meta
          name="description"
          content="Contactez-moi pour toute demande de projet ou d'information."
        />
      </Helmet>
      <div className="max-w-4xl mx-auto pb-20 text-text-main">
        <div className="border-2 border-border-subtle p-8 md:p-12 shadow-2xl bg-bg-panel relative overflow-hidden">
          {/* Decorative background text */}
          <div className="absolute -top-10 -right-10 opacity-[0.02] pointer-events-none select-none">
            <span className="text-[200px] font-black uppercase leading-none">
              POST
            </span>
          </div>

          <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter flex items-center gap-4">
            <span className="w-8 h-8 bg-primary"></span>
            Contact
          </h1>

          {status.type && (
            <div
              className={`p-6 mb-8 border-2 font-bold uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] ${status.type === "success" ? "bg-green-500/20 border-green-500 text-green-500" : "bg-red-500/20 border-red-500 text-red-500"}`}
            >
              [{status.type === "success" ? "OK" : "ERROR"}] {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-xs font-black uppercase tracking-[0.2em] text-primary"
                >
                  Sender_Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-bg-main border border-border-subtle focus:border-primary outline-none transition-colors font-mono text-text-main"
                  placeholder="VOTRE NOM"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="sender"
                  className="block text-xs font-black uppercase tracking-[0.2em] text-primary"
                >
                  Email / Phone
                </label>
                <input
                  type="sender"
                  id="sender"
                  name="sender"
                  value={formData.sender}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-bg-main border border-border-subtle focus:border-primary outline-none transition-colors font-mono text-text-main"
                  placeholder="EMAIL / TÉLÉPHONE"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="object"
                className="block text-xs font-black uppercase tracking-[0.2em] text-primary"
              >
                Subject_Header
              </label>
              <input
                type="text"
                id="object"
                name="object"
                value={formData.object}
                onChange={handleChange}
                required
                className="w-full p-4 bg-bg-main border border-border-subtle focus:border-primary outline-none transition-colors font-mono text-text-main"
                placeholder="OBJET"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-primary">
                Message_Body
              </label>
              <div className="border border-border-subtle focus-within:border-primary transition-all bg-bg-main">
                <MenuBar editor={editor} />
                <div className="min-h-[250px] font-mono text-text-main">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full md:w-auto"
            >
              <div className="absolute inset-0 bg-primary opacity-20 translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
              <div className="relative bg-primary border-2 border-white text-white px-12 py-5 uppercase font-black tracking-widest text-lg hover:bg-bg-panel hover:text-white transition-colors flex items-center justify-center gap-3 shadow-xl">
                {isSubmitting ? "ENVOI EN COURS..." : "TRANSMETTRE"}
                {!isSubmitting && <span>&rarr;</span>}
              </div>
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Contact;
