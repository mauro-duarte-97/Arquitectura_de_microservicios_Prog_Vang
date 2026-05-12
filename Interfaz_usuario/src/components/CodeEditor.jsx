import Editor from "@monaco-editor/react";
import React from "react";

export default function CodeEditor({ language, value, onChange, readOnly = false }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      <Editor
        height="430px"
        language={language}
        value={value}
        theme="vs-dark"
        onChange={(newValue) => onChange?.(newValue ?? "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
        }}
      />
    </div>
  );
}
