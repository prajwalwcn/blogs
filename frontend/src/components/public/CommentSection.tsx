"use client";

import { useState, useEffect } from "react";
import { MessageSquare, User, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Comment {
  id: number;
  name: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  blogId: number;
  blogSlug: string;
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export default function CommentSection({ blogId, blogSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  
  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`${API_URL}/api/blogs/${blogId}/comments`, {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const json = await res.json();
          setComments(json.data ?? []);
        }
      } catch (err) {
        console.error("Error loading comments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [blogId]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !content) return;

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          blog_id: blogId,
          blog_slug: blogSlug,
          name,
          email,
          content,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setStatusMsg({
          type: "success",
          text: json.message || "Your comment has been submitted and is awaiting moderation.",
        });
        // Clear textarea
        setContent("");
      } else {
        setStatusMsg({
          type: "error",
          text: json.message || "Failed to submit comment. Please check your inputs.",
        });
      }
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: "A connection error occurred. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  function getInitials(username: string) {
    return username.trim().slice(0, 2).toUpperCase() || "AN";
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <section className="mt-14 pt-10 border-t border-zinc-200/80" aria-labelledby="comments-heading">
      
      {/* Heading */}
      <div className="flex items-center gap-3.5 mb-8">
        <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-650">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h3 id="comments-heading" className="text-2xl font-bold text-zinc-900 leading-none">
            Discussion & Feedback
          </h3>
          <p className="text-sm text-zinc-550 mt-1.5">
            Share your thoughts, ask questions, or provide feedback on this blog. All comments are moderated before being published.
          </p>
        </div>
      </div>

      {/* Grid of form + list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left column: Submit Comment */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
          <h4 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider mb-4">
            Leave a Reply
          </h4>
          <p className="text-sm text-zinc-450 mb-6 leading-relaxed">
            Your email address will not be published. Required fields are marked *
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="comment-name" className="block text-sm font-bold text-zinc-550 uppercase tracking-wider mb-1.5">
                Name *
              </label>
              <input
                id="comment-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full text-base px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-zinc-50/50"
              />
            </div>

            <div>
              <label htmlFor="comment-email" className="block text-sm font-bold text-zinc-555 uppercase tracking-wider mb-1.5">
                Email *
              </label>
              <input
                id="comment-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="w-full text-base px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-zinc-50/50"
              />
            </div>

            <div>
              <label htmlFor="comment-text" className="block text-sm font-bold text-zinc-555 uppercase tracking-wider mb-1.5">
                Comment *
              </label>
              <textarea
                id="comment-text"
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, suggestions, or ask a question..."
                className="w-full text-base px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-zinc-50/50 resize-y"
              />
            </div>

            {/* Submission Status Alert */}
            {statusMsg && (
              <div
                className={`p-3.5 rounded-xl border flex gap-3 items-start text-sm leading-relaxed ${
                  statusMsg.type === "success"
                    ? "bg-[#eefcf2] border-[#22c55e]/25 text-[#15803d]"
                    : "bg-red-50 border-red-200/50 text-red-700"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle className="h-4.5 w-4.5 text-[#22c55e] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-[#2665A3] hover:bg-[#1f5284] disabled:bg-zinc-300 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Post Comment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right column: Comments List */}
        <div className="space-y-4">
          <h4 className="text-base font-extrabold text-zinc-800 uppercase tracking-wider mb-4">
            Recent Comments
          </h4>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-455 py-6">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>Loading discussion...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="bg-[#f4f7fc]/70 border border-zinc-200/50 rounded-2xl p-6 text-center text-zinc-500 py-10">
              <MessageSquare className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No comments approved yet.</p>
              <p className="text-xs text-zinc-400 mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white border border-zinc-150 rounded-2xl p-4 shadow-sm flex gap-3.5"
                >
                  <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                    <User className="h-4 w-4 text-zinc-450" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <span className="text-sm font-bold text-zinc-900 truncate">
                        {comment.name}
                      </span>
                      <span className="text-[11px] font-medium text-zinc-400">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-zinc-650 leading-relaxed break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
