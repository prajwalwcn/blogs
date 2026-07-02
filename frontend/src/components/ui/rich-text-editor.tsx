"use client";

import * as React from "react";
import { Bold, Italic, Underline, List, ListOrdered, Code, Strikethrough, Trash2, Table, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = "Write description here...",
  error,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const lastValueRef = React.useRef<string | null>(null);
  const [activeStates, setActiveStates] = React.useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
  });

  // Table insert states
  const [showTableModal, setShowTableModal] = React.useState(false);
  const [rowsCount, setRowsCount] = React.useState(3);
  const [colsCount, setColsCount] = React.useState(3);
  const [colColors, setColColors] = React.useState<string[]>(["#2665A3", "#2665A3", "#709d1e", "#2665A3"]);

  // Sync column colors with column count
  React.useEffect(() => {
    setColColors((prev) => {
      const next = [...prev];
      while (next.length < colsCount) {
        const colNum = next.length + 1;
        // Default column 3 (BUDGET) to green (#709d1e), others to blue (#2665A3)
        next.push(colNum === 3 ? "#709d1e" : "#2665A3");
      }
      return next.slice(0, colsCount);
    });
  }, [colsCount]);

  // Keep editor content in sync with external value updates (like API load)
  React.useEffect(() => {
    if (editorRef.current) {
      if (value !== lastValueRef.current) {
        editorRef.current.innerHTML = value || "";
        lastValueRef.current = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastValueRef.current = html;
      onChange(html);
      updateActiveStates();
    }
  };

  const executeCommand = (command: string, valueStr: string = "") => {
    if (disabled) return;
    document.execCommand(command, false, valueStr);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleClearContent = () => {
    if (disabled) return;
    if (confirm("Are you sure you want to clear all content in the editor?")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
        lastValueRef.current = "";
        onChange("");
        updateActiveStates();
        editorRef.current.focus();
      }
    }
  };

  const updateActiveStates = () => {
    setActiveStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
    });
  };

  const insertHTML = (html: string) => {
    if (disabled) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      
      const fragment = document.createDocumentFragment();
      let child = tempDiv.firstChild;
      while (child) {
        const next = child.nextSibling;
        fragment.appendChild(child);
        child = next;
      }
      
      range.insertNode(fragment);
      
      // Move cursor after the inserted element
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(tempDiv);
      newRange.collapse(false);
      
      handleInput();
    } else {
      if (editorRef.current) {
        editorRef.current.innerHTML += html;
        handleInput();
      }
    }
  };

  const handleInsertTableDirectly = (rows: number, cols: number) => {
    // We use border-spacing: 12px 0px to separate the columns horizontally
    let tableHtml = `<table style="width: 100%; border-collapse: separate; border-spacing: 12px 0px; margin: 2rem 0; background-color: transparent; border: none;">`;
    
    // Header row
    tableHtml += `<thead><tr>`;
    for (let c = 0; c < cols; c++) {
      const bg = colColors[c] || "#2665A3";
      const thClass = bg === "#709d1e" ? 'class="highlight-column"' : '';
      
      tableHtml += `<th ${thClass} style="background-color: ${bg}; color: #ffffff; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 16px; text-align: center; border: none;">Header ${c + 1}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;
    
    // Body rows
    for (let r = 0; r < rows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < cols; c++) {
        const isFirstCol = (c === 0);
        const colBg = colColors[c] || "#2665A3";
        const isHighlighted = colBg === "#709d1e";
        const tdClass = isHighlighted ? 'class="highlight-column"' : '';
        
        // All columns alternate: odd rows = light gray, even rows = white
        const bg = (r % 2 === 0) ? "#f3f4f6" : "#ffffff";
        const color = isFirstCol ? "#1f2937" : "#374151";
        const fontWeight = isFirstCol ? "700" : "normal";
        
        tableHtml += `<td ${tdClass} style="background-color: ${bg}; color: ${color}; font-weight: ${fontWeight}; padding: 12px 16px; text-align: center; vertical-align: middle; border: none;">Cell</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;
    
    insertHTML(tableHtml);
  };

  return (
    <div className="w-full space-y-1.5 relative">
      <div
        className={cn(
          "w-full rounded-lg border border-input bg-white dark:bg-zinc-900/50 overflow-hidden focus-within:border-brand-orange focus-within:ring-3 focus-within:ring-brand-orange/20 transition-all",
          error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20",
          disabled && "opacity-80 bg-zinc-50 dark:bg-zinc-955/20"
        )}
      >
        {/* Toolbar (Hidden when disabled) */}
        {!disabled && (
          <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/55 dark:bg-zinc-950/40 select-none">
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              className={cn(
                "p-1.5 rounded text-zinc-700 dark:text-zinc-350 cursor-pointer transition-colors",
                activeStates.bold ? "bg-brand-orange/15 text-brand-orange font-bold" : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              className={cn(
                "p-1.5 rounded text-zinc-700 dark:text-zinc-350 cursor-pointer transition-colors",
                activeStates.italic ? "bg-brand-orange/15 text-brand-orange font-bold" : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("underline")}
              className={cn(
                "p-1.5 rounded text-zinc-700 dark:text-zinc-350 cursor-pointer transition-colors",
                activeStates.underline ? "bg-brand-orange/15 text-brand-orange font-bold" : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("strikeThrough")}
              className={cn(
                "p-1.5 rounded text-zinc-700 dark:text-zinc-350 cursor-pointer transition-colors",
                activeStates.strikeThrough ? "bg-brand-orange/15 text-brand-orange font-bold" : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </button>
            
            <span className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 mx-1" />

            <button
              type="button"
              onClick={() => executeCommand("insertUnorderedList")}
              className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-350 cursor-pointer"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertOrderedList")}
              className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-350 cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>

            <span className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 mx-1" />

            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "pre")}
              className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-350 cursor-pointer"
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "blockquote")}
              className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-350 cursor-pointer"
              title="Quote Block"
            >
              <Quote className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowTableModal(true)}
              className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-350 cursor-pointer flex items-center justify-center"
              title="Insert Table Grid"
            >
              <Table className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleClearContent}
              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 cursor-pointer ml-auto transition-colors"
              title="Clear All Content"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Editor Content Area */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyUp={updateActiveStates}
          onMouseUp={updateActiveStates}
          data-placeholder={placeholder}
          className={cn(
            "max-w-none min-h-[220px] p-4 outline-none text-sm text-zinc-900 dark:text-slate-100 focus:outline-none overflow-y-auto leading-relaxed whitespace-pre-wrap break-words",
            "after:content-[attr(data-placeholder)] after:text-zinc-400 dark:after:text-zinc-550 after:pointer-events-none empty:after:inline-block after:hidden empty:after:block",
            "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:mt-1",
            "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:mt-1",
            "[&_li]:mb-1",
            "[&_p]:mb-3",
            "[&_pre]:bg-zinc-100 dark:[&_pre]:bg-zinc-900/60 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-3 [&_pre]:overflow-x-auto",
            "[&_table:not([style*='border: none'])]:w-full [&_table:not([style*='border: none'])]:border-collapse [&_table:not([style*='border: none'])]:border [&_table:not([style*='border: none'])]:border-zinc-200 dark:[&_table:not([style*='border: none'])]:border-zinc-800 [&_table:not([style*='border: none'])]:my-6 [&_table:not([style*='border: none'])]:rounded-lg [&_table:not([style*='border: none'])]:overflow-hidden",
            "[&_table:not([style*='border: none'])_th]:border [&_table:not([style*='border: none'])_th]:border-zinc-200 dark:[&_table:not([style*='border: none'])_th]:border-zinc-800 [&_table:not([style*='border: none'])_th]:p-3 [&_table:not([style*='border: none'])_th]:text-center [&_table:not([style*='border: none'])_th]:bg-[#2665A3] [&_table:not([style*='border: none'])_th]:text-white [&_table:not([style*='border: none'])_th]:font-bold",
            "[&_table:not([style*='border: none'])_td]:border [&_table:not([style*='border: none'])_td]:border-zinc-200 dark:[&_table:not([style*='border: none'])_td]:border-zinc-800 [&_table:not([style*='border: none'])_td]:p-3 [&_table:not([style*='border: none'])_td]:text-center [&_table:not([style*='border: none'])_td]:bg-white dark:[&_table:not([style*='border: none'])_td]:bg-zinc-950",
            "[&_table:not([style*='border: none'])_tbody_tr_td:first-child]:bg-zinc-50 dark:[&_table:not([style*='border: none'])_tbody_tr_td:first-child]:bg-zinc-900 [&_table:not([style*='border: none'])_tbody_tr_td:first-child]:font-bold [&_table:not([style*='border: none'])_tbody_tr_td:first-child]:text-zinc-800 dark:[&_table:not([style*='border: none'])_tbody_tr_td:first-child]:text-zinc-200",
            "[&_th.highlight-column]:bg-[#709d1e] [&_th.highlight-column]:text-white",
            "[&_blockquote]:border-t [&_blockquote]:border-b [&_blockquote]:border-dashed [&_blockquote]:border-zinc-300 dark:[&_blockquote]:border-zinc-700 [&_blockquote]:py-6 [&_blockquote]:pl-16 [&_blockquote]:pr-4 [&_blockquote]:my-6 [&_blockquote]:relative [&_blockquote]:text-zinc-850 dark:[&_blockquote]:text-zinc-200 [&_blockquote]:font-bold [&_blockquote]:leading-relaxed [&_blockquote]:before:content-['“'] [&_blockquote]:before:absolute [&_blockquote]:before:left-3 [&_blockquote]:before:top-1 [&_blockquote]:before:text-6xl [&_blockquote]:before:font-serif [&_blockquote]:before:text-zinc-300 dark:[&_blockquote]:before:text-zinc-700",
            disabled ? "cursor-not-allowed bg-zinc-50 dark:bg-zinc-950/20" : "cursor-text"
          )}
          style={{
            minHeight: "220px",
          }}
        />
      </div>

      {/* Inline Insert Table Modal Card */}
      {showTableModal && (
        <div className="absolute inset-0 bg-zinc-950/15 dark:bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 w-64 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h5 className="text-xs font-black uppercase tracking-wider text-brand-orange">Insert Table Grid</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">Rows</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={rowsCount}
                  onChange={(e) => setRowsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-xs outline-none focus:border-brand-orange"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">Columns</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={colsCount}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    setColsCount(val);
                  }}
                  className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-xs outline-none focus:border-brand-orange"
                />
              </div>
            </div>
            <div className="space-y-2 border-t border-zinc-200/80 dark:border-zinc-800 pt-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 block">Column Header Colors</span>
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: colsCount }, (_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-center">Col {i + 1}</label>
                    <div className="relative">
                      <input
                        type="color"
                        value={colColors[i] || "#2665A3"}
                        onChange={(e) => {
                          const updated = [...colColors];
                          updated[i] = e.target.value;
                          setColColors(updated);
                        }}
                        className="w-7 h-7 rounded-full border-2 border-zinc-300 dark:border-zinc-600 bg-transparent cursor-pointer p-0 overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full"
                        title={`Column ${i + 1} header color`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-3 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleInsertTableDirectly(rowsCount, colsCount);
                  setShowTableModal(false);
                }}
                className="px-3 py-1 rounded bg-brand-orange hover:bg-brand-orange-hover text-white font-bold cursor-pointer"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500 font-semibold">{error}</p>
      )}
    </div>
  );
}
